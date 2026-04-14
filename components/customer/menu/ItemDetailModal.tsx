"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { OptionGroup } from "./OptionGroup"
import { useCartStore } from "@/store/cartStore"
import { formatCurrency } from "@/lib/utils"
import { DIETARY_FLAGS } from "@/lib/constants"
import { Minus, Plus } from "lucide-react"
import { toast } from "sonner"
import type { CartItemChoice, MenuItemWithOptions, Restaurant } from "@/types"
import type { MenuItemOptionChoice } from "@/types"

interface Props {
  item: MenuItemWithOptions
  restaurant: Restaurant
  onClose: () => void
}

export function ItemDetailModal({ item, restaurant, onClose }: Props) {
  const [quantity, setQuantity] = useState(1)
  const [choices, setChoices] = useState<Record<string, MenuItemOptionChoice | MenuItemOptionChoice[]>>({})
  const [specialInstructions, setSpecialInstructions] = useState("")
  const addItem = useCartStore((s) => s.addItem)

  const choiceList: CartItemChoice[] = item.options.flatMap((opt) => {
    const selected = choices[opt.id]
    if (!selected) return []
    const arr = Array.isArray(selected) ? selected : [selected]
    return arr.map((c) => ({
      option_id: opt.id,
      option_name: opt.name,
      choice_id: c.id,
      choice_name: c.name,
      price_modifier: c.price_modifier,
    }))
  })

  const unitPrice = item.base_price + choiceList.reduce((s, c) => s + c.price_modifier, 0)
  const total = unitPrice * quantity

  // Validate required options
  const missingRequired = item.options.filter((opt) => opt.is_required && !choices[opt.id])

  const handleAdd = () => {
    if (missingRequired.length > 0) {
      toast.error(`Please select: ${missingRequired.map((o) => o.name).join(", ")}`)
      return
    }
    addItem({
      restaurantId: restaurant.id,
      restaurantSlug: restaurant.slug,
      menu_item_id: item.id,
      name: item.name,
      image_url: item.image_url,
      base_price: item.base_price,
      quantity,
      choices: choiceList,
      special_instructions: specialInstructions || undefined,
      unit_price: unitPrice,
    })
    toast.success(`${item.name} added to order`)
    onClose()
  }

  const dietaryBadges = DIETARY_FLAGS.filter((f) => item[f.key as keyof typeof item])

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0 gap-0">
        {item.image_url && (
          <div className="relative h-52 w-full shrink-0">
            <Image src={item.image_url} alt={item.name} fill className="object-cover rounded-t-lg" />
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 pb-0">
            <DialogHeader>
              <DialogTitle className="text-xl">{item.name}</DialogTitle>
            </DialogHeader>
            {item.description && <p className="text-sm text-muted-foreground mt-2">{item.description}</p>}
            {dietaryBadges.length > 0 && (
              <div className="flex gap-2 mt-3">
                {dietaryBadges.map((f) => (
                  <span key={f.key} title={f.label} className="text-lg">{f.emoji}</span>
                ))}
              </div>
            )}
          </div>

          {item.options.length > 0 && (
            <div className="px-6 mt-4 space-y-4">
              <Separator />
              {item.options.map((opt) => (
                <OptionGroup
                  key={opt.id}
                  option={opt}
                  value={choices[opt.id]}
                  onChange={(val) => setChoices((prev) => ({ ...prev, [opt.id]: val }))}
                />
              ))}
            </div>
          )}

          <div className="px-6 mt-4 mb-6">
            <Separator className="mb-4" />
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Special instructions <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Textarea
              placeholder="Allergies, extra sauce, no onions…"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={2}
              className="text-sm"
            />
          </div>
        </div>

        <div className="border-t px-6 py-4 flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-semibold">{quantity}</span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(quantity + 1)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button className="flex-1" onClick={handleAdd}>
            Add to order · {formatCurrency(total)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
