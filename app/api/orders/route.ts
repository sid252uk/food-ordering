import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendOrderConfirmation, sendOwnerNewOrder } from "@/lib/email/send"
import type { CreateCashOrderRequest, CreateCashOrderResponse } from "@/types/api"

export async function POST(request: Request) {
  try {
    const body: CreateCashOrderRequest = await request.json()
    const supabase = await createClient()

    // Fetch restaurant
    const { data: restaurant, error: restError } = await supabase
      .from("restaurants")
      .select("id, name, email, delivery_fee, tax_rate, min_order_amount")
      .eq("id", body.restaurant_id)
      .eq("is_active", true)
      .single()

    if (restError || !restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
    }

    // Validate items server-side
    const itemIds = body.items.map((i) => i.menu_item_id)
    const choiceIds = body.items.flatMap((i) => i.choices.map((c) => c.choice_id))

    const { data: menuItems } = await supabase
      .from("menu_items")
      .select("id, base_price, name, image_url")
      .in("id", itemIds)
      .eq("restaurant_id", restaurant.id)
      .eq("is_active", true)

    if (!menuItems || menuItems.length !== itemIds.length) {
      return NextResponse.json({ error: "One or more items unavailable" }, { status: 400 })
    }

    const { data: choices } = await supabase
      .from("menu_item_option_choices")
      .select("id, price_modifier, option_id, name")
      .in("id", choiceIds)

    const choiceMap = new Map((choices ?? []).map((c) => [c.id, c]))

    let subtotal = 0
    const validatedItems = body.items.map((item) => {
      const menuItem = menuItems.find((m) => m.id === item.menu_item_id)!
      const choicePrices = item.choices.reduce((sum, c) => sum + (choiceMap.get(c.choice_id)?.price_modifier ?? 0), 0)
      const unit_price = menuItem.base_price + choicePrices
      const total_price = unit_price * item.quantity
      subtotal += total_price
      return { ...item, unit_price, total_price, menuItem, choiceDetails: item.choices.map((c) => choiceMap.get(c.choice_id)) }
    })

    if (subtotal < restaurant.min_order_amount) {
      return NextResponse.json({ error: `Minimum order is $${restaurant.min_order_amount}` }, { status: 400 })
    }

    // Promo
    let discountAmount = 0
    let promoCodeId: string | null = null
    if (body.promo_code) {
      const { data: promo } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .eq("code", body.promo_code.toUpperCase())
        .eq("is_active", true)
        .single()
      if (promo) {
        const now = new Date()
        const valid =
          (!promo.starts_at || new Date(promo.starts_at) <= now) &&
          (!promo.expires_at || new Date(promo.expires_at) > now) &&
          (promo.max_uses === null || promo.current_uses < promo.max_uses) &&
          (!promo.min_order_amount || subtotal >= promo.min_order_amount)
        if (valid) {
          promoCodeId = promo.id
          discountAmount = promo.promo_type === "percentage"
            ? subtotal * (promo.discount_value / 100)
            : Math.min(promo.discount_value, subtotal)
        }
      }
    }

    const deliveryFee = body.order_type === "delivery" ? restaurant.delivery_fee : 0
    const effectiveSubtotal = Math.max(0, subtotal - discountAmount)
    const taxAmount = effectiveSubtotal * restaurant.tax_rate
    const tipAmount = body.tip_amount ?? 0
    const totalAmount = effectiveSubtotal + deliveryFee + taxAmount + tipAmount

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        restaurant_id: restaurant.id,
        order_type: body.order_type as "delivery" | "pickup",
        status: "pending",
        guest_email: body.contact.email,
        guest_phone: body.contact.phone,
        guest_name: body.contact.name,
        delivery_address_snapshot: body.delivery_address ? JSON.stringify(body.delivery_address) : null,
        delivery_notes: body.delivery_address?.delivery_notes ?? null,
        subtotal,
        delivery_fee: deliveryFee,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        tip_amount: tipAmount,
        total_amount: totalAmount,
        promo_code_id: promoCodeId,
        promo_code_used: body.promo_code?.toUpperCase() ?? null,
        payment_type: "cash",
        payment_status: "pending_cash",
        special_instructions: body.special_instructions ?? null,
      })
      .select()
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }

    // Insert order items
    for (const item of validatedItems) {
      const { data: orderItem } = await supabase
        .from("order_items")
        .insert({
          order_id: order.id,
          menu_item_id: item.menu_item_id,
          menu_item_snapshot: { name: item.menuItem.name, image_url: item.menuItem.image_url, base_price: item.menuItem.base_price },
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          special_instructions: item.special_instructions ?? null,
        })
        .select("id")
        .single()

      if (orderItem && item.choices.length > 0) {
        await supabase.from("order_item_choices").insert(
          item.choices.map((c, idx) => ({
            order_item_id: orderItem.id,
            option_id: c.option_id,
            choice_id: c.choice_id,
            choice_name: item.choiceDetails[idx]?.name ?? "",
            price_modifier: item.choiceDetails[idx]?.price_modifier ?? 0,
          }))
        )
      }
    }

    // Emails
    sendOrderConfirmation(body.contact.email, {
      orderNumber: order.order_number,
      restaurantName: restaurant.name,
      items: validatedItems.map((i) => ({ name: i.menuItem.name, quantity: i.quantity, price: i.total_price })),
      total: totalAmount,
      orderType: body.order_type,
    }).catch(console.error)

    if (restaurant.email) {
      sendOwnerNewOrder(restaurant.email, {
        orderNumber: order.order_number,
        items: validatedItems.map((i) => ({ name: i.menuItem.name, quantity: i.quantity })),
        total: totalAmount,
        orderType: body.order_type,
        customerName: body.contact.name,
      }).catch(console.error)
    }

    return NextResponse.json<CreateCashOrderResponse>({ order_id: order.id, order_number: order.order_number })
  } catch (err) {
    console.error("[orders]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
