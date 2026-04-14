import { createClient } from "@/lib/supabase/server"
import { OrderQueue } from "@/components/admin/orders/OrderQueue"

export default async function AdminOrdersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name, slug")
    .eq("slug", slug)
    .single()
  if (!restaurant) return null
  return <OrderQueue restaurant={restaurant} />
}
