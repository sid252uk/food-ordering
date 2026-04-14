"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { useCartStore } from "@/store/cartStore"
import { useCart } from "@/hooks/useCart"
import { useRestaurant } from "@/hooks/useRestaurant"
import { usePromoValidation } from "@/hooks/usePromoValidation"
import { formatCurrency } from "@/lib/utils"

export function PromoCodeInput({ restaurantSlug }: { restaurantSlug: string }) {
  const [code, setCode] = useState("")
  const { promoCode, discountAmount, clearPromoCode, setPromoCode, restaurantId } = useCartStore()
  const { validate, isLoading } = usePromoValidation()
  const { subtotal } = useCart()
  const { data: restaurant } = useRestaurant(restaurantSlug)

  const handleApply = async () => {
    if (!code.trim() || !restaurant) return
    const result = await validate(code.trim().toUpperCase(), restaurant.id, subtotal)
    if (result.valid && result.promo_code_id) {
      setPromoCode(result.promo_code_id, code.trim().toUpperCase(), result.discount_amount)
      setCode("")
    }
  }

  if (promoCode) {
    return (
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md px-3 py-2">
        <div>
          <p className="text-sm font-medium text-green-800">{promoCode} applied</p>
          <p className="text-xs text-green-600">-{formatCurrency(discountAmount)} off</p>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-green-700" onClick={clearPromoCode}>
          <X className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Promo code"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === "Enter" && handleApply()}
        className="text-sm"
      />
      <Button variant="outline" size="sm" onClick={handleApply} disabled={isLoading || !code.trim()}>
        {isLoading ? "…" : "Apply"}
      </Button>
    </div>
  )
}
