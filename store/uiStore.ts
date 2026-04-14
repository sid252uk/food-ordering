"use client"

import { create } from "zustand"

interface UIState {
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
  toggleCart: () => void
  activeCategory: string | null
  setActiveCategory: (id: string | null) => void
  selectedMenuItemId: string | null
  setSelectedMenuItemId: (id: string | null) => void
}

export const useUIStore = create<UIState>()((set) => ({
  cartOpen: false,
  setCartOpen: (open) => set({ cartOpen: open }),
  toggleCart: () => set((s) => ({ cartOpen: !s.cartOpen })),
  activeCategory: null,
  setActiveCategory: (id) => set({ activeCategory: id }),
  selectedMenuItemId: null,
  setSelectedMenuItemId: (id) => set({ selectedMenuItemId: id }),
}))
