"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/lib/supabase/client"
import { menuCategorySchema } from "@/lib/validations"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import type { z } from "zod"
import type { MenuCategory } from "@/types"

type FormData = z.infer<typeof menuCategorySchema>

interface Props {
  restaurantId: string
  category: MenuCategory | null
  onClose: () => void
  onSaved: () => void
}

export function CategoryForm({ restaurantId, category, onClose, onSaved }: Props) {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(menuCategorySchema),
    defaultValues: {
      name: category?.name ?? "",
      description: category?.description ?? "",
      is_active: category?.is_active ?? true,
    },
  })

  const onSubmit = async (data: FormData) => {
    const supabase = createClient()
    if (category) {
      const { error } = await supabase.from("menu_categories").update(data).eq("id", category.id)
      if (error) { toast.error("Failed to update category"); return }
      toast.success("Category updated")
    } else {
      const { error } = await supabase.from("menu_categories").insert({ ...data, restaurant_id: restaurantId })
      if (error) { toast.error("Failed to create category"); return }
      toast.success("Category created")
    }
    onSaved()
    onClose()
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{category ? "Edit category" : "New category"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Description <span className="text-muted-foreground">(optional)</span></Label>
            <Textarea {...register("description")} rows={2} />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={watch("is_active")} onCheckedChange={(v) => setValue("is_active", v)} />
            <Label>Visible to customers</Label>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Save"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
