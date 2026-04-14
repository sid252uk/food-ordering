import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { OrderTracker } from "@/components/customer/orders/OrderTracker"

export default async function OrderTrackerPage({
  params,
}: {
  params: Promise<{ slug: string; orderId: string }>
}) {
  const { orderId } = await params
  const supabase = await createClient()
  const { data: order } = await supabase
    .from("orders")
    .select(`*, items:order_items(*, choices:order_item_choices(*)), restaurant:restaurants(id, name, slug, logo_url)`)
    .eq("id", orderId)
    .single()

  if (!order) notFound()

  return <OrderTracker initialOrder={order as Parameters<typeof OrderTracker>[0]["initialOrder"]} />
}
