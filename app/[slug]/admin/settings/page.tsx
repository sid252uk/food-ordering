import { createClient } from "@/lib/supabase/server"
import { RestaurantSettingsForm } from "@/components/admin/settings/RestaurantSettingsForm"
import { notFound } from "next/navigation"

export default async function AdminSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .single()

  if (!restaurant) return notFound()

  return <RestaurantSettingsForm restaurant={restaurant} />
}
