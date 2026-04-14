import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getStripeServer, decryptKey } from "@/lib/stripe/server"
import { sendOrderConfirmation, sendOwnerNewOrder } from "@/lib/email/send"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  const supabase = await createClient()

  // Fetch restaurant keys
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name, email, stripe_secret_key_encrypted, stripe_webhook_secret_encrypted")
    .eq("slug", slug)
    .single()

  if (!restaurant || !restaurant.stripe_secret_key_encrypted || !restaurant.stripe_webhook_secret_encrypted) {
    return NextResponse.json({ error: "Restaurant not configured" }, { status: 400 })
  }

  const secretKey = decryptKey(restaurant.stripe_secret_key_encrypted)
  const webhookSecret = decryptKey(restaurant.stripe_webhook_secret_encrypted)
  const stripe = getStripeServer(secretKey)

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as { id: string; amount: number; payment_method?: string; charges?: { data?: Array<{ receipt_url?: string; payment_method_details?: { card?: { last4?: string; brand?: string }; type?: string } }> } }

    // Idempotency: check if order already exists for this intent
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("order_id")
      .eq("stripe_payment_intent_id", paymentIntent.id)
      .single()

    if (existingPayment?.order_id) {
      return NextResponse.json({ received: true }) // already processed
    }

    // Retrieve full cart JSON from payments.receipt_url (stored during intent creation)
    const { data: paymentRow } = await supabase
      .from("payments")
      .select("receipt_url")
      .eq("stripe_payment_intent_id", paymentIntent.id)
      .single()

    if (!paymentRow?.receipt_url) {
      console.error("[webhook] No cart JSON found for", paymentIntent.id)
      return NextResponse.json({ error: "Cart data not found" }, { status: 400 })
    }

    let cart: {
      restaurant_id: string
      order_type: string
      items: Array<{
        menu_item_id: string
        quantity: number
        unit_price: number
        total_price: number
        special_instructions?: string
        snapshot: { name: string; image_url: string | null; base_price: number }
        choices: Array<{ choice_id: string; option_id: string; choice_name: string; price_modifier: number }>
      }>
      subtotal: number
      delivery_fee: number
      discount_amount: number
      tax_amount: number
      tip_amount: number
      total_amount: number
      promo_code_id: string | null
      promo_code_used: string | null
      contact: { name: string; email: string; phone: string }
      delivery_address: { address_line1: string; city: string; state: string; postal_code: string; country: string; delivery_notes?: string } | null
      special_instructions: string | null
    }

    try {
      cart = JSON.parse(paymentRow.receipt_url)
    } catch {
      return NextResponse.json({ error: "Invalid cart data" }, { status: 400 })
    }

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        restaurant_id: restaurant.id,
        order_type: cart.order_type as "delivery" | "pickup",
        status: "pending",
        guest_email: cart.contact.email,
        guest_phone: cart.contact.phone,
        guest_name: cart.contact.name,
        delivery_address_snapshot: cart.delivery_address ? JSON.stringify(cart.delivery_address) : null,
        delivery_notes: cart.delivery_address?.delivery_notes ?? null,
        subtotal: cart.subtotal,
        delivery_fee: cart.delivery_fee,
        discount_amount: cart.discount_amount,
        tax_amount: cart.tax_amount,
        tip_amount: cart.tip_amount,
        total_amount: cart.total_amount,
        promo_code_id: cart.promo_code_id,
        promo_code_used: cart.promo_code_used,
        payment_type: "stripe",
        payment_status: "completed",
        special_instructions: cart.special_instructions,
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error("[webhook] Failed to insert order:", orderError)
      return NextResponse.json({ error: "Order creation failed" }, { status: 500 })
    }

    // Insert order items
    for (const item of cart.items) {
      const { data: orderItem, error: itemError } = await supabase
        .from("order_items")
        .insert({
          order_id: order.id,
          menu_item_id: item.menu_item_id,
          menu_item_snapshot: item.snapshot,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          special_instructions: item.special_instructions ?? null,
        })
        .select("id")
        .single()

      if (itemError || !orderItem) continue

      // Insert choices
      if (item.choices.length > 0) {
        await supabase.from("order_item_choices").insert(
          item.choices.map((c) => ({
            order_item_id: orderItem.id,
            option_id: c.option_id,
            choice_id: c.choice_id,
            choice_name: c.choice_name,
            price_modifier: c.price_modifier,
          }))
        )
      }
    }

    // Update payment row with the order_id and real receipt URL
    const charge = (paymentIntent.charges?.data ?? [])[0]
    await supabase
      .from("payments")
      .update({
        order_id: order.id,
        status: "succeeded",
        receipt_url: charge?.receipt_url ?? null,
        last_four: charge?.payment_method_details?.card?.last4 ?? null,
        payment_method_type: charge?.payment_method_details?.type ?? "card",
      })
      .eq("stripe_payment_intent_id", paymentIntent.id)

    // Send emails (non-blocking)
    sendOrderConfirmation(cart.contact.email, {
      orderNumber: order.order_number,
      restaurantName: restaurant.name,
      items: cart.items.map((i) => ({ name: i.snapshot.name, quantity: i.quantity, price: i.total_price })),
      total: cart.total_amount,
      orderType: cart.order_type,
    }).catch(console.error)

    if (restaurant.email) {
      sendOwnerNewOrder(restaurant.email, {
        orderNumber: order.order_number,
        items: cart.items.map((i) => ({ name: i.snapshot.name, quantity: i.quantity })),
        total: cart.total_amount,
        orderType: cart.order_type,
        customerName: cart.contact.name,
      }).catch(console.error)
    }
  }

  return NextResponse.json({ received: true })
}
