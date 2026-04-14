import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { OrderConfirmation } from "@/components/customer/orders/OrderConfirmation"

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ order_id?: string; payment_intent_id?: string }>
}) {
  const { slug } = await params
  const { order_id, payment_intent_id } = await searchParams
  const supabase = await createClient()

  let resolvedOrderId = order_id

  // If redirected from Stripe with payment_intent_id, look up the order
  if (!resolvedOrderId && payment_intent_id) {
    const { data: payment } = await supabase
      .from("payments")
      .select("order_id")
      .eq("stripe_payment_intent_id", payment_intent_id)
      .single()
    resolvedOrderId = payment?.order_id ?? undefined
  }

  if (!resolvedOrderId) redirect(`/${slug}`)

  const { data: order } = await supabase
    .from("orders")
    .select(`*, items:order_items(*, choices:order_item_choices(*)), restaurant:restaurants(id, name, slug, logo_url)`)
    .eq("id", resolvedOrderId)
    .single()

  if (!order) redirect(`/${slug}`)

  return <OrderConfirmation order={order as unknown as Parameters<typeof OrderConfirmation>[0]["order"]} />
}
