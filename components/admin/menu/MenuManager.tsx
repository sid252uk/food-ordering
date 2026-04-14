"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CategoryList } from "./CategoryList"
import { MenuItemList } from "./MenuItemList"
import { CategoryForm } from "./CategoryForm"
import { MenuItemForm } from "./MenuItemForm"
import { Plus } from "lucide-react"
import type { MenuCategory, MenuCategoryWithItems } from "@/types"

export function MenuManager({ restaurant }: { restaurant: { id: string; slug: string; name: string } }) {
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showItemForm, setShowItemForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-menu", restaurant.id],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("menu_categories")
        .select(`*, items:menu_items(*, options:menu_item_options(*, choices:menu_item_option_choices(*)))`)
        .eq("restaurant_id", restaurant.id)
        .order("display_order")
      if (error) throw error
      return data as unknown as MenuCategoryWithItems[]
    },
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-menu", restaurant.id] })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Menu</h1>

      <Tabs defaultValue="categories">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="items">Items</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => { setEditingCategory(null); setShowCategoryForm(true) }}>
              <Plus className="h-4 w-4 mr-1" /> Category
            </Button>
            <Button size="sm" onClick={() => { setEditingItemId(null); setShowItemForm(true) }}>
              <Plus className="h-4 w-4 mr-1" /> Item
            </Button>
          </div>
        </div>

        <TabsContent value="categories">
          <CategoryList
            categories={categories ?? []}
            isLoading={isLoading}
            restaurantId={restaurant.id}
            onEdit={(cat) => { setEditingCategory(cat); setShowCategoryForm(true) }}
            onRefresh={invalidate}
          />
        </TabsContent>

        <TabsContent value="items">
          <MenuItemList
            categories={categories ?? []}
            isLoading={isLoading}
            onEdit={(id) => { setEditingItemId(id); setShowItemForm(true) }}
            onRefresh={invalidate}
          />
        </TabsContent>
      </Tabs>

      {showCategoryForm && (
        <CategoryForm
          restaurantId={restaurant.id}
          category={editingCategory}
          onClose={() => { setShowCategoryForm(false); setEditingCategory(null) }}
          onSaved={invalidate}
        />
      )}

      {showItemForm && (
        <MenuItemForm
          restaurantId={restaurant.id}
          categories={categories ?? []}
          itemId={editingItemId}
          onClose={() => { setShowItemForm(false); setEditingItemId(null) }}
          onSaved={invalidate}
        />
      )}
    </div>
  )
}
