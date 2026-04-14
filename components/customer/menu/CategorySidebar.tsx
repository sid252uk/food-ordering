"use client"

import { useEffect, useRef } from "react"
import { useUIStore } from "@/store/uiStore"
import type { MenuCategoryWithItems } from "@/types"
import { cn } from "@/lib/utils"

export function CategorySidebar({ categories }: { categories: MenuCategoryWithItems[] }) {
  const { activeCategory, setActiveCategory } = useUIStore()
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id.replace("category-", ""))
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    )
    categories.forEach((cat) => {
      const el = document.getElementById(`category-${cat.id}`)
      if (el) observerRef.current?.observe(el)
    })
    return () => observerRef.current?.disconnect()
  }, [categories, setActiveCategory])

  const scrollTo = (id: string) => {
    document.getElementById(`category-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <nav className="sticky top-24 space-y-1">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => scrollTo(cat.id)}
          className={cn(
            "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
            activeCategory === cat.id
              ? "bg-blue-50 text-blue-700 font-medium"
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          {cat.name}
          <span className="ml-2 text-xs text-muted-foreground">({cat.items.length})</span>
        </button>
      ))}
    </nav>
  )
}
