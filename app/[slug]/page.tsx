import { createClient } from "@/lib/supabase/server"
import { MenuPage } from "@/components/customer/menu/MenuPage"
import type { MenuCategoryWithItems, Restaurant } from "@/types"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from("restaurants").select("name, description").eq("slug", slug).single()
  return {
    title: data ? `${data.name} — Order Online` : "Order Online",
    description: data?.description || `Order online from ${data?.name}`,
  }
}

export default async function RestaurantMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .single()

  if (!restaurant) return null

  // Fetch initial menu server-side for fast first paint
  const { data: categories } = await supabase
    .from("menu_categories")
    .select(`
      *,
      items:menu_items(
        *,
        options:menu_item_options(*, choices:menu_item_option_choices(*))
      )
    `)
    .eq("restaurant_id", restaurant.id)
    .eq("is_active", true)
    .order("display_order")

  return (
    <MenuPage
      restaurant={restaurant as Restaurant}
      initialCategories={(categories ?? []) as MenuCategoryWithItems[]}
    />
  )
}
