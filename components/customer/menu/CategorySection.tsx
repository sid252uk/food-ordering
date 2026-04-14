import { ItemCard } from "./ItemCard"
import type { MenuCategoryWithItems, MenuItemWithOptions } from "@/types"

interface Props {
  category: MenuCategoryWithItems
  onItemClick: (item: MenuItemWithOptions) => void
}

export function CategorySection({ category, onItemClick }: Props) {
  if (category.items.length === 0) return null

  return (
    <section id={`category-${category.id}`}>
      <h2 className="text-xl font-bold text-gray-900 mb-1">{category.name}</h2>
      {category.description && (
        <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {category.items.map((item) => (
          <ItemCard key={item.id} item={item as MenuItemWithOptions} onClick={() => onItemClick(item as MenuItemWithOptions)} />
        ))}
      </div>
    </section>
  )
}
