"use client"

import { useState, useCallback } from "react"
import type { ValidatePromoResponse } from "@/types/api"

export function usePromoValidation() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ValidatePromoResponse | null>(null)

  const validate = useCallback(async (code: string, restaurantId: string, subtotal: number) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, restaurant_id: restaurantId, subtotal }),
      })
      const data: ValidatePromoResponse = await res.json()
      setResult(data)
      return data
    } catch {
      const err: ValidatePromoResponse = { valid: false, discount_amount: 0, error: "Network error" }
      setResult(err)
      return err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => setResult(null), [])
  return { validate, isLoading, result, reset }
}
