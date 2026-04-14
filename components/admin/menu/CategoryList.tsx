"use client"

import { useState } from "react"
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { GripVertical, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { MenuCategory, MenuCategoryWithItems } from "@/types"

function SortableRow({ cat, onEdit, onDelete }: { cat: MenuCategoryWithItems; onEdit: (c: MenuCategory) => void; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 bg-white border rounded-lg px-4 py-3 ${isDragging ? "opacity-50 shadow-lg" : ""}`}
    >
      <button {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 shrink-0">
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{cat.name}</p>
        <p className="text-xs text-muted-foreground">{cat.items.length} items</p>
      </div>
      {!cat.is_active && <Badge variant="secondary" className="text-xs">Hidden</Badge>}
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(cat)}><Pencil className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(cat.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>
    </div>
  )
}

interface Props {
  categories: MenuCategoryWithItems[]
  isLoading: boolean
  restaurantId: string
  onEdit: (cat: MenuCategory) => void
  onRefresh: () => void
}

export function CategoryList({ categories, isLoading, restaurantId, onEdit, onRefresh }: Props) {
  const [localCats, setLocalCats] = useState<MenuCategoryWithItems[]>([])
  const displayCats = localCats.length > 0 ? localCats : categories

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = displayCats.findIndex((c) => c.id === active.id)
    const newIndex = displayCats.findIndex((c) => c.id === over.id)
    const reordered = arrayMove(displayCats, oldIndex, newIndex)
    setLocalCats(reordered)
    const supabase = createClient()
    await Promise.all(reordered.map((cat, idx) =>
      supabase.from("menu_categories").update({ display_order: idx }).eq("id", cat.id)
    ))
    onRefresh()
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("menu_categories").delete().eq("id", id)
    if (error) toast.error("Failed to delete category")
    else { toast.success("Category deleted"); onRefresh() }
  }

  if (isLoading) return <div className="space-y-2">{[1,2,3].map((n) => <Skeleton key={n} className="h-14 rounded-lg" />)}</div>
  if (displayCats.length === 0) return <p className="text-sm text-muted-foreground text-center py-8">No categories yet. Add one to get started.</p>

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={displayCats.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {displayCats.map((cat) => (
            <SortableRow key={cat.id} cat={cat} onEdit={onEdit} onDelete={handleDelete} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
