import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import type { MenuCategoryWithItems } from "@/types"

interface UseMenuOptions {
  restaurantId: string
  search?: string
  dietaryFilters?: {
    is_vegetarian?: boolean
    is_vegan?: boolean
    is_gluten_free?: boolean
    contains_nuts?: boolean
    is_spicy?: boolean
  }
}

export function useMenu({ restaurantId, search, dietaryFilters }: UseMenuOptions) {
  return useQuery({
    queryKey: ["menu", restaurantId, search, dietaryFilters],
    queryFn: async () => {
      const supabase = createClient()

      const { data: categories, error: catError } = await supabase
        .from("menu_categories")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .eq("is_active", true)
        .order("display_order")

      if (catError) throw catError

      let itemsQuery = supabase
        .from("menu_items")
        .select(`
          *,
          options:menu_item_options(
            *,
            choices:menu_item_option_choices(*)
          )
        `)
        .eq("restaurant_id", restaurantId)
        .eq("is_active", true)
        .order("display_order")

      if (search) itemsQuery = itemsQuery.ilike("name", `%${search}%`)
      if (dietaryFilters?.is_vegetarian) itemsQuery = itemsQuery.eq("is_vegetarian", true)
      if (dietaryFilters?.is_vegan) itemsQuery = itemsQuery.eq("is_vegan", true)
      if (dietaryFilters?.is_gluten_free) itemsQuery = itemsQuery.eq("is_gluten_free", true)
      if (dietaryFilters?.contains_nuts) itemsQuery = itemsQuery.eq("contains_nuts", true)
      if (dietaryFilters?.is_spicy) itemsQuery = itemsQuery.eq("is_spicy", true)

      const { data: items, error: itemsError } = await itemsQuery
      if (itemsError) throw itemsError

      return (categories ?? []).map((cat) => ({
        ...(cat as object),
        items: (items ?? []).filter((item) => item.category_id === cat.id),
      })) as unknown as MenuCategoryWithItems[]
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!restaurantId,
  })
}
