"use client"

import { useEffect, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/lib/supabase/client"
import { menuItemSchema } from "@/lib/validations"
import { useUpload } from "@/hooks/useUpload"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"
import { DIETARY_FLAGS } from "@/lib/constants"
import type { z } from "zod"
import type { MenuCategoryWithItems } from "@/types"

type FormData = z.infer<typeof menuItemSchema>

interface Props {
  restaurantId: string
  categories: MenuCategoryWithItems[]
  itemId: string | null
  onClose: () => void
  onSaved: () => void
}

export function MenuItemForm({ restaurantId, categories, itemId, onClose, onSaved }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const { upload, isUploading } = useUpload({ bucket: "menu-images", folder: restaurantId })

  const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: { is_vegetarian: false, is_vegan: false, is_gluten_free: false, contains_nuts: false, is_spicy: false, is_featured: false, options: [] },
  })

  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({ control, name: "options" })

  // Load existing item
  useEffect(() => {
    if (!itemId) return
    const supabase = createClient()
    supabase.from("menu_items").select("*, options:menu_item_options(*, choices:menu_item_option_choices(*))").eq("id", itemId).single()
      .then(({ data }) => {
        if (!data) return
        setValue("name", data.name)
        setValue("description", data.description ?? "")
        setValue("base_price", data.base_price)
        setValue("category_id", data.category_id)
        setValue("is_vegetarian", data.is_vegetarian)
        setValue("is_vegan", data.is_vegan)
        setValue("is_gluten_free", data.is_gluten_free)
        setValue("contains_nuts", data.contains_nuts)
        setValue("is_spicy", data.is_spicy)
        setValue("is_featured", data.is_featured)
        setImageUrl(data.image_url)
        if (data.options) {
          setValue("options", data.options.map((opt: { name: string; selection_type: string; is_required: boolean; min_selections: number; max_selections: number | null; choices: Array<{ name: string; price_modifier: number; display_order: number }> }) => ({
            name: opt.name,
            selection_type: opt.selection_type as "single" | "multiple",
            is_required: opt.is_required,
            min_selections: opt.min_selections,
            max_selections: opt.max_selections ?? undefined,
            choices: opt.choices ?? [],
          })))
        }
      })
  }, [itemId, setValue])

  const onSubmit = async (data: FormData) => {
    const supabase = createClient()
    const itemData = {
      restaurant_id: restaurantId,
      category_id: data.category_id,
      name: data.name,
      description: data.description ?? null,
      base_price: data.base_price,
      image_url: imageUrl,
      is_vegetarian: data.is_vegetarian,
      is_vegan: data.is_vegan,
      is_gluten_free: data.is_gluten_free,
      contains_nuts: data.contains_nuts,
      is_spicy: data.is_spicy,
      is_featured: data.is_featured,
    }

    let savedItemId = itemId
    if (itemId) {
      const { error } = await supabase.from("menu_items").update(itemData).eq("id", itemId)
      if (error) { toast.error("Failed to update item"); return }
      // Delete and recreate options
      await supabase.from("menu_item_options").delete().eq("menu_item_id", itemId)
    } else {
      const { data: newItem, error } = await supabase.from("menu_items").insert(itemData).select("id").single()
      if (error || !newItem) { toast.error("Failed to create item"); return }
      savedItemId = newItem.id
    }

    // Insert options + choices
    for (let i = 0; i < (data.options ?? []).length; i++) {
      const opt = data.options![i]
      const { data: savedOpt } = await supabase.from("menu_item_options").insert({
        menu_item_id: savedItemId!,
        name: opt.name,
        selection_type: opt.selection_type,
        is_required: opt.is_required,
        min_selections: opt.min_selections ?? 0,
        max_selections: opt.max_selections ?? null,
        display_order: i,
      }).select("id").single()
      if (savedOpt && opt.choices) {
        await supabase.from("menu_item_option_choices").insert(
          opt.choices.map((c, idx) => ({
            option_id: savedOpt.id,
            name: c.name,
            price_modifier: c.price_modifier ?? 0,
            display_order: idx,
          }))
        )
      }
    }

    toast.success(itemId ? "Item updated" : "Item created")
    onSaved()
    onClose()
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await upload(file)
    if (url) setImageUrl(url)
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{itemId ? "Edit item" : "New menu item"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Name</Label>
              <Input {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Price</Label>
              <Input type="number" step="0.01" {...register("base_price", { valueAsNumber: true })} />
              {errors.base_price && <p className="text-sm text-destructive">{errors.base_price.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select onValueChange={(v) => setValue("category_id", v)} defaultValue={watch("category_id")}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.category_id && <p className="text-sm text-destructive">{errors.category_id.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description <span className="text-muted-foreground">(optional)</span></Label>
            <Textarea {...register("description")} rows={2} />
          </div>

          <div className="space-y-2">
            <Label>Image <span className="text-muted-foreground">(optional)</span></Label>
            <div className="flex items-center gap-3">
              <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="max-w-xs" />
              {isUploading && <span className="text-sm text-muted-foreground">Uploading…</span>}
              {imageUrl && <img src={imageUrl} alt="Preview" className="h-10 w-10 rounded object-cover" />}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Dietary</p>
            <div className="flex flex-wrap gap-3">
              {DIETARY_FLAGS.map((f) => (
                <label key={f.key} className="flex items-center gap-1.5 cursor-pointer text-sm">
                  <Switch checked={!!watch(f.key as keyof FormData)} onCheckedChange={(v) => setValue(f.key as keyof FormData, v as never)} />
                  <span>{f.emoji} {f.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={!!watch("is_featured")} onCheckedChange={(v) => setValue("is_featured", v)} />
            <Label>Featured item</Label>
          </div>

          <Separator />

          {/* Options */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="font-medium">Customisation options</p>
              <Button type="button" size="sm" variant="outline" onClick={() => appendOption({ name: "", selection_type: "single", is_required: false, min_selections: 0, choices: [{ name: "", price_modifier: 0, display_order: 0 }] })}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add option
              </Button>
            </div>
            {optionFields.map((field, optIdx) => (
              <div key={field.id} className="border rounded-lg p-4 mb-3">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">Option {optIdx + 1}</p>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeOption(optIdx)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Group name</Label>
                    <Input {...register(`options.${optIdx}.name`)} placeholder="e.g. Choose size" className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Type</Label>
                    <Select onValueChange={(v) => setValue(`options.${optIdx}.selection_type`, v as "single" | "multiple")} defaultValue="single">
                      <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single choice</SelectItem>
                        <SelectItem value="multiple">Multiple choice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Switch checked={!!watch(`options.${optIdx}.is_required`)} onCheckedChange={(v) => setValue(`options.${optIdx}.is_required`, v)} />
                  <Label className="text-xs font-normal">Required</Label>
                </div>
                {/* Choices */}
                <OptionChoices control={control} register={register} optIdx={optIdx} watch={watch} setValue={setValue} />
              </div>
            ))}
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>{isSubmitting ? "Saving…" : "Save item"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function OptionChoices({ control, register, optIdx, watch, setValue }: { control: ReturnType<typeof useForm<FormData>>["control"]; register: ReturnType<typeof useForm<FormData>>["register"]; optIdx: number; watch: ReturnType<typeof useForm<FormData>>["watch"]; setValue: ReturnType<typeof useForm<FormData>>["setValue"] }) {
  const { fields, append, remove } = useFieldArray({ control, name: `options.${optIdx}.choices` })
  return (
    <div>
      <div className="space-y-2 mb-2">
        {fields.map((f, choiceIdx) => (
          <div key={f.id} className="flex gap-2 items-center">
            <Input {...register(`options.${optIdx}.choices.${choiceIdx}.name`)} placeholder="Choice name" className="h-7 text-xs flex-1" />
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-xs text-muted-foreground">+$</span>
              <Input type="number" step="0.01" {...register(`options.${optIdx}.choices.${choiceIdx}.price_modifier`, { valueAsNumber: true })} defaultValue={0} className="h-7 text-xs w-16" />
            </div>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => remove(choiceIdx)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" variant="ghost" size="sm" className="text-xs h-6" onClick={() => append({ name: "", price_modifier: 0, display_order: fields.length })}>
        <Plus className="h-3 w-3 mr-1" /> Add choice
      </Button>
    </div>
  )
}
