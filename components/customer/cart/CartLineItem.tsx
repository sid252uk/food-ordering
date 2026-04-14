"use client"

import { Minus, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cartStore"
import { formatCurrency } from "@/lib/utils"
import type { CartItem } from "@/types"

export function CartLineItem({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCartStore()

  return (
    <div className="flex gap-3">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
        {item.choices.length > 0 && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {item.choices.map((c) => c.choice_name).join(", ")}
          </p>
        )}
        {item.special_instructions && (
          <p className="text-xs text-muted-foreground italic mt-0.5">"{item.special_instructions}"</p>
        )}
        <p className="text-sm font-medium mt-1">{formatCurrency(item.total_price)}</p>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.id)}>
          <X className="h-3 w-3" />
        </Button>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
