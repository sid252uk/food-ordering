import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getStripeServer, decryptKey } from "@/lib/stripe/server"
import type { CreatePaymentIntentRequest, CreatePaymentIntentResponse } from "@/types/api"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body: CreatePaymentIntentRequest = await request.json()
    const supabase = await createClient()

    // Fetch restaurant (validates slug + gets Stripe key)
    const { data: restaurant, error: restError } = await supabase
      .from("restaurants")
      .select("id, name, delivery_fee, tax_rate, min_order_amount, stripe_secret_key_encrypted, stripe_webhook_secret_encrypted")
      .eq("slug", slug)
      .eq("is_active", true)
      .single()

    if (restError || !restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
    }

    if (!restaurant.stripe_secret_key_encrypted) {
      return NextResponse.json({ error: "Online payments not configured for this restaurant" }, { status: 400 })
    }

    // Validate + price all items SERVER-SIDE (never trust client)
    const itemIds = body.items.map((i) => i.menu_item_id)
    const choiceIds = body.items.flatMap((i) => i.choices.map((c) => c.choice_id))

    const { data: menuItems, error: itemsError } = await supabase
      .from("menu_items")
      .select("id, base_price, name, image_url, is_active")
      .in("id", itemIds)
      .eq("restaurant_id", restaurant.id)
      .eq("is_active", true)

    if (itemsError || !menuItems || menuItems.length !== itemIds.length) {
      return NextResponse.json({ error: "One or more items are unavailable" }, { status: 400 })
    }

    const { data: choices } = await supabase
      .from("menu_item_option_choices")
      .select("id, price_modifier, option_id, name")
      .in("id", choiceIds)

    const choiceMap = new Map((choices ?? []).map((c) => [c.id, c]))

    // Calculate totals server-side
    let subtotal = 0
    const validatedItems = body.items.map((item) => {
      const menuItem = menuItems.find((m) => m.id === item.menu_item_id)!
      const choicePrices = item.choices.reduce((sum, c) => {
        const choice = choiceMap.get(c.choice_id)
        return sum + (choice?.price_modifier ?? 0)
      }, 0)
      const unit_price = menuItem.base_price + choicePrices
      const total_price = unit_price * item.quantity
      subtotal += total_price
      return { ...item, unit_price, total_price, menuItem, choiceDetails: item.choices.map((c) => choiceMap.get(c.choice_id)) }
    })

    // Validate minimum order
    if (subtotal < restaurant.min_order_amount) {
      return NextResponse.json({ error: `Minimum order is $${restaurant.min_order_amount}` }, { status: 400 })
    }

    // Promo discount
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
    const total = effectiveSubtotal + deliveryFee + taxAmount + tipAmount
    const totalCents = Math.round(total * 100)

    // Build cart metadata to embed in PaymentIntent (used by webhook)
    const cartJson = JSON.stringify({
      restaurant_id: restaurant.id,
      order_type: body.order_type,
      items: validatedItems.map((i) => ({
        menu_item_id: i.menu_item_id,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total_price: i.total_price,
        special_instructions: i.special_instructions,
        snapshot: { name: i.menuItem.name, image_url: i.menuItem.image_url, base_price: i.menuItem.base_price },
        choices: i.choices.map((c, idx) => ({
          choice_id: c.choice_id,
          option_id: c.option_id,
          choice_name: i.choiceDetails[idx]?.name ?? "",
          price_modifier: i.choiceDetails[idx]?.price_modifier ?? 0,
        })),
      })),
      subtotal,
      delivery_fee: deliveryFee,
      discount_amount: discountAmount,
      tax_amount: taxAmount,
      tip_amount: tipAmount,
      total_amount: total,
      promo_code_id: promoCodeId,
      promo_code_used: body.promo_code?.toUpperCase() ?? null,
      contact: body.contact,
      delivery_address: body.delivery_address ?? null,
      special_instructions: body.special_instructions ?? null,
    })

    const secretKey = decryptKey(restaurant.stripe_secret_key_encrypted)
    const stripe = getStripeServer(secretKey)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        slug,
        restaurant_id: restaurant.id,
        cart_json: cartJson.slice(0, 500), // Stripe metadata limit is 500 chars per value
      },
      description: `Order from ${restaurant.name}`,
    })

    // Store full cart in a temporary payments row linked to intent
    await supabase.from("payments").insert({
      restaurant_id: restaurant.id,
      stripe_payment_intent_id: paymentIntent.id,
      amount: total,
      status: "pending",
    })

    const response: CreatePaymentIntentResponse = {
      client_secret: paymentIntent.client_secret!,
      payment_intent_id: paymentIntent.id,
      amount: total,
      publishable_key: "", // Not needed here — already on client
      breakdown: {
        subtotal,
        delivery_fee: deliveryFee,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        tip_amount: tipAmount,
        total,
      },
    }

    // Store full cart JSON in a server-side cache keyed by payment_intent_id
    // We use Supabase to store it since Stripe metadata is capped at 500 chars
    await supabase.from("payments")
      .update({ receipt_url: cartJson }) // repurposed for cart storage temporarily
      .eq("stripe_payment_intent_id", paymentIntent.id)

    return NextResponse.json(response)
  } catch (err) {
    console.error("[create-payment-intent]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
