import { Badge } from "@/components/ui/badge"
import { ORDER_STATUSES } from "@/lib/constants"
import type { OrderStatus } from "@/lib/constants"
import { cn } from "@/lib/utils"

const COLOR_MAP: Record<string, string> = {
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
  blue: "bg-blue-100 text-blue-800 border-blue-200",
  orange: "bg-orange-100 text-orange-800 border-orange-200",
  green: "bg-green-100 text-green-800 border-green-200",
  purple: "bg-purple-100 text-purple-800 border-purple-200",
  gray: "bg-gray-100 text-gray-700 border-gray-200",
  red: "bg-red-100 text-red-800 border-red-200",
}

interface Props {
  status: OrderStatus
  className?: string
}

export function StatusBadge({ status, className }: Props) {
  const meta = ORDER_STATUSES.find((s) => s.value === status)
  const colorClass = meta ? (COLOR_MAP[meta.color] ?? COLOR_MAP.gray) : COLOR_MAP.gray
  return (
    <Badge variant="outline" className={cn("font-medium text-xs border", colorClass, className)}>
      {meta?.label ?? status}
    </Badge>
  )
}
