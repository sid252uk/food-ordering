import { createClient } from "@/lib/supabase/server"
import { MenuManager } from "@/components/admin/menu/MenuManager"

export default async function AdminMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name, slug")
    .eq("slug", slug)
    .single()
  if (!restaurant) return null
  return <MenuManager restaurant={restaurant} />
}
