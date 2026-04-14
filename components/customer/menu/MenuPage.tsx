"use client"

import { useState, useMemo } from "react"
import { useMenu } from "@/hooks/useMenu"
import { CategorySidebar } from "./CategorySidebar"
import { CategorySection } from "./CategorySection"
import { MenuSearch } from "./MenuSearch"
import { DietaryFilter } from "./DietaryFilter"
import { ItemDetailModal } from "./ItemDetailModal"
import { useUIStore } from "@/store/uiStore"
import type { MenuCategoryWithItems, MenuItemWithOptions, Restaurant } from "@/types"

interface Props {
  restaurant: Restaurant
  initialCategories: MenuCategoryWithItems[]
}

export function MenuPage({ restaurant, initialCategories }: Props) {
  const [search, setSearch] = useState("")
  const [dietaryFilters, setDietaryFilters] = useState<Record<string, boolean>>({})
  const { selectedMenuItemId, setSelectedMenuItemId } = useUIStore()

  const { data: categories } = useMenu({
    restaurantId: restaurant.id,
    search: search || undefined,
    dietaryFilters: Object.keys(dietaryFilters).length ? dietaryFilters as Parameters<typeof useMenu>[0]["dietaryFilters"] : undefined,
  })

  const displayCategories = categories ?? initialCategories
  const allItems = useMemo(() => displayCategories.flatMap((c) => c.items), [displayCategories])
  const selectedItem = useMemo(
    () => allItems.find((i) => i.id === selectedMenuItemId) ?? null,
    [allItems, selectedMenuItemId]
  )

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Search + filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <MenuSearch value={search} onChange={setSearch} />
          <DietaryFilter value={dietaryFilters} onChange={setDietaryFilters} />
        </div>

        <div className="flex gap-6">
          {/* Sidebar — hidden on mobile */}
          <aside className="hidden lg:block w-56 shrink-0">
            <CategorySidebar categories={displayCategories} />
          </aside>

          {/* Menu content */}
          <div className="flex-1 min-w-0 space-y-10">
            {displayCategories.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                {search ? `No items found for "${search}"` : "No menu items available yet."}
              </div>
            ) : (
              displayCategories.map((category) => (
                <CategorySection
                  key={category.id}
                  category={category}
                  onItemClick={(item) => setSelectedMenuItemId(item.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem as MenuItemWithOptions}
          restaurant={restaurant}
          onClose={() => setSelectedMenuItemId(null)}
        />
      )}
    </>
  )
}
