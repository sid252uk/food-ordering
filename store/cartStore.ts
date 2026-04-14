"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { CartItem } from "@/types"

interface CartState {
  restaurantId: string | null
  restaurantSlug: string | null
  items: CartItem[]
  promoCodeId: string | null
  promoCode: string | null
  discountAmount: number

  addItem: (
    item: Omit<CartItem, "id" | "total_price"> & {
      restaurantId: string
      restaurantSlug: string
    }
  ) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void
  setPromoCode: (
    promoCodeId: string | null,
    code: string | null,
    discountAmount: number
  ) => void
  clearPromoCode: () => void
  itemCount: () => number
  subtotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      restaurantId: null,
      restaurantSlug: null,
      items: [],
      promoCodeId: null,
      promoCode: null,
      discountAmount: 0,

      addItem: ({ restaurantId, restaurantSlug, ...item }) => {
        const state = get()
        // Clear cart if switching restaurants
        if (state.restaurantId && state.restaurantId !== restaurantId) {
          set({
            items: [],
            restaurantId,
            restaurantSlug,
            promoCodeId: null,
            promoCode: null,
            discountAmount: 0,
          })
        } else if (!state.restaurantId) {
          set({ restaurantId, restaurantSlug })
        }

        const id = crypto.randomUUID()
        const unit_price =
          item.base_price +
          item.choices.reduce((sum, c) => sum + c.price_modifier, 0)
        const cartItem: CartItem = {
          ...item,
          id,
          unit_price,
          total_price: unit_price * item.quantity,
        }
        set((s) => ({ items: [...s.items, cartItem] }))
      },

      removeItem: (cartItemId) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== cartItemId) })),

      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId)
          return
        }
        set((s) => ({
          items: s.items.map((i) =>
            i.id === cartItemId
              ? { ...i, quantity, total_price: i.unit_price * quantity }
              : i
          ),
        }))
      },

      clearCart: () =>
        set({
          items: [],
          restaurantId: null,
          restaurantSlug: null,
          promoCodeId: null,
          promoCode: null,
          discountAmount: 0,
        }),

      setPromoCode: (promoCodeId, code, discountAmount) =>
        set({ promoCodeId, promoCode: code, discountAmount }),

      clearPromoCode: () =>
        set({ promoCodeId: null, promoCode: null, discountAmount: 0 }),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.total_price, 0),
    }),
    {
      name: "food-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
