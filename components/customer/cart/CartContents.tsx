"use client"

import Link from "next/link"
import { useCart } from "@/hooks/useCart"
import { useUIStore } from "@/store/uiStore"
import { CartLineItem } from "./CartLineItem"
import { CartTotals } from "./CartTotals"
import { PromoCodeInput } from "./PromoCodeInput"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ShoppingBag } from "lucide-react"

export function CartContents({ restaurantSlug }: { restaurantSlug: string }) {
  const { items, restaurantSlug: cartSlug } = useCart()
  const setCartOpen = useUIStore((s) => s.setCartOpen)
  const relevantItems = cartSlug === restaurantSlug ? items : []

  if (relevantItems.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
          <ShoppingBag className="h-8 w-8 text-gray-400" />
        </div>
        <div>
          <p className="font-medium text-gray-900">Your cart is empty</p>
          <p className="text-sm text-muted-foreground mt-1">Add items from the menu to get started</p>
        </div>
        <Button variant="outline" onClick={() => setCartOpen(false)}>Browse menu</Button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {relevantItems.map((item) => (
          <CartLineItem key={item.id} item={item} />
        ))}
      </div>
      <div className="border-t px-6 py-4 space-y-4">
        <PromoCodeInput restaurantSlug={restaurantSlug} />
        <Separator />
        <CartTotals restaurantSlug={restaurantSlug} />
        <Link href={`/${restaurantSlug}/checkout`} onClick={() => setCartOpen(false)}>
          <Button className="w-full" size="lg">
            Proceed to checkout
          </Button>
        </Link>
      </div>
    </div>
  )
}
