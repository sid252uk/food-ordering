"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/hooks/useCart"
import { useUIStore } from "@/store/uiStore"

export function CartButton({ restaurantSlug }: { restaurantSlug: string }) {
  const { itemCount, restaurantSlug: cartSlug } = useCart()
  const toggleCart = useUIStore((s) => s.toggleCart)

  const count = cartSlug === restaurantSlug ? itemCount : 0

  return (
    <Button variant="outline" size="icon" className="relative" onClick={toggleCart}>
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
          {count > 99 ? "99+" : count}
        </Badge>
      )}
    </Button>
  )
}
