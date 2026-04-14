"use client"

import { useCart } from "@/hooks/useCart"
import { useRestaurant } from "@/hooks/useRestaurant"
import { formatCurrency } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

export function CartTotals({ restaurantSlug }: { restaurantSlug: string }) {
  const { subtotal, discountAmount, restaurantSlug: cartSlug } = useCart()
  const { data: restaurant } = useRestaurant(restaurantSlug)

  if (cartSlug !== restaurantSlug) return null

  const deliveryFee = restaurant?.delivery_fee ?? 0
  const taxRate = restaurant?.tax_rate ?? 0.08
  const effectiveSubtotal = Math.max(0, subtotal - discountAmount)
  const tax = effectiveSubtotal * taxRate
  const total = effectiveSubtotal + deliveryFee + tax

  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between text-muted-foreground">
        <span>Subtotal</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      {discountAmount > 0 && (
        <div className="flex justify-between text-green-600">
          <span>Discount</span>
          <span>-{formatCurrency(discountAmount)}</span>
        </div>
      )}
      <div className="flex justify-between text-muted-foreground">
        <span>Delivery fee</span>
        <span>{deliveryFee === 0 ? "Free" : formatCurrency(deliveryFee)}</span>
      </div>
      <div className="flex justify-between text-muted-foreground">
        <span>Tax ({Math.round(taxRate * 100)}%)</span>
        <span>{formatCurrency(tax)}</span>
      </div>
      <Separator />
      <div className="flex justify-between font-semibold text-base">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
  )
}
