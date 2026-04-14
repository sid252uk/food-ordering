"use client"

import { useUIStore } from "@/store/uiStore"
import { useCart } from "@/hooks/useCart"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { CartContents } from "./CartContents"
import { ShoppingCart } from "lucide-react"

export function CartSheet({ restaurantSlug }: { restaurantSlug: string }) {
  const { cartOpen, setCartOpen } = useUIStore()
  const { items, restaurantSlug: cartSlug } = useCart()
  const relevantItems = cartSlug === restaurantSlug ? items : []

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your order {relevantItems.length > 0 && `(${relevantItems.reduce((s, i) => s + i.quantity, 0)})`}
          </SheetTitle>
        </SheetHeader>
        <CartContents restaurantSlug={restaurantSlug} />
      </SheetContent>
    </Sheet>
  )
}
