"use client"

import { useCartStore } from "@/store/cartStore"

export function useCart() {
  const store = useCartStore()
  const subtotal = store.subtotal()
  const itemCount = store.itemCount()
  return { ...store, subtotal, itemCount }
}
