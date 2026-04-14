import { createClient } from "@/lib/supabase/server"
import { PromoManager } from "@/components/admin/promos/PromoManager"

export default async function AdminPromosPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: restaurant } = await supabase.from("restaurants").select("id, slug").eq("slug", slug).single()
  if (!restaurant) return null
  return <PromoManager restaurant={restaurant} />
}
