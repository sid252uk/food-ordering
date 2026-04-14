import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { DIETARY_FLAGS } from "@/lib/constants"
import type { MenuItemWithOptions } from "@/types"

interface Props {
  item: MenuItemWithOptions
  onClick: () => void
}

export function ItemCard({ item, onClick }: Props) {
  const dietaryBadges = DIETARY_FLAGS.filter((f) => item[f.key as keyof typeof item])

  return (
    <button
      onClick={onClick}
      className="group text-left bg-white rounded-xl border hover:border-blue-300 hover:shadow-md transition-all overflow-hidden w-full"
    >
      {item.image_url ? (
        <div className="relative h-40 overflow-hidden">
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="h-40 bg-gray-100 flex items-center justify-center text-4xl">🍽️</div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{item.name}</p>
            {item.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
            )}
          </div>
          <div className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 group-hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-bold text-gray-900">{formatCurrency(item.base_price)}</span>
          <div className="flex gap-1">
            {dietaryBadges.slice(0, 2).map((f) => (
              <span key={f.key} title={f.label} className="text-base leading-none">{f.emoji}</span>
            ))}
          </div>
        </div>
      </div>
    </button>
  )
}
