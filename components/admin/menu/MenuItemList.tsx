"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"
import { DIETARY_FLAGS } from "@/lib/constants"
import type { MenuCategoryWithItems } from "@/types"

interface Props {
  categories: MenuCategoryWithItems[]
  isLoading: boolean
  onEdit: (id: string) => void
  onRefresh: () => void
}

export function MenuItemList({ categories, isLoading, onEdit, onRefresh }: Props) {
  const allItems = categories.flatMap((c) => c.items.map((i) => ({ ...i, categoryName: c.name })))

  const toggleAvailability = async (id: string, current: boolean) => {
    const supabase = createClient()
    const { error } = await supabase.from("menu_items").update({ is_active: !current }).eq("id", id)
    if (error) toast.error("Failed to update item")
    else onRefresh()
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("menu_items").delete().eq("id", id)
    if (error) toast.error("Failed to delete item")
    else { toast.success("Item deleted"); onRefresh() }
  }

  if (isLoading) return <div className="space-y-2">{[1,2,3,4].map((n) => <Skeleton key={n} className="h-16 rounded-lg" />)}</div>
  if (allItems.length === 0) return <p className="text-sm text-muted-foreground text-center py-8">No menu items yet. Add one to get started.</p>

  return (
    <div className="space-y-2">
      {allItems.map((item) => {
        const dietaryBadges = DIETARY_FLAGS.filter((f) => item[f.key as keyof typeof item])
        return (
          <div key={item.id} className="flex items-center gap-3 bg-white border rounded-lg px-4 py-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm truncate">{item.name}</p>
                {!item.is_active && <Badge variant="secondary" className="text-xs shrink-0">Hidden</Badge>}
                {item.is_featured && <Badge className="text-xs shrink-0">Featured</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {item.categoryName} · {formatCurrency(item.base_price)}
                {dietaryBadges.length > 0 && " · " + dietaryBadges.map((f) => f.emoji).join("")}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Switch checked={item.is_active} onCheckedChange={() => toggleAvailability(item.id, item.is_active)} />
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(item.id)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(item.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
