import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ChevronRight } from "lucide-react"
import type { OrderWithItems } from "@/types"

const NEXT_STATUS: Record<string, string> = {
  pending: "accepted",
  accepted: "preparing",
  preparing: "ready",
  ready: "delivered", // or picked_up — handled by order type
}

const ACTION_LABELS: Record<string, string> = {
  pending: "Accept",
  accepted: "Start preparing",
  preparing: "Mark ready",
  ready: "Mark complete",
}

interface Props {
  order: OrderWithItems
  onStatusChange: (status: string) => void
  onClick: () => void
}

export function OrderQueueCard({ order, onStatusChange, onClick }: Props) {
  const nextStatus = order.status === "ready"
    ? (order.order_type === "pickup" ? "picked_up" : "delivered")
    : NEXT_STATUS[order.status]

  const timeSince = (date: string) => {
    const mins = Math.round((Date.now() - new Date(date).getTime()) / 60000)
    return mins < 60 ? `${mins}m ago` : `${Math.floor(mins / 60)}h ago`
  }

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold">#{order.order_number}</p>
          <p className="text-xs text-muted-foreground">{timeSince(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant={order.order_type === "delivery" ? "default" : "secondary"} className="text-xs">
            {order.order_type === "delivery" ? "🛵 Delivery" : "🏪 Pickup"}
          </Badge>
          <Badge variant={order.payment_type === "cash" ? "outline" : "default"} className="text-xs">
            {order.payment_type === "cash" ? "Cash" : "Paid"}
          </Badge>
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-1">{order.guest_name ?? "Guest"}</p>

      <div className="text-xs text-muted-foreground mb-3 space-y-0.5">
        {(order.items ?? []).slice(0, 3).map((item) => (
          <p key={item.id}>{item.quantity}× {(item.menu_item_snapshot as { name?: string })?.name ?? "Item"}</p>
        ))}
        {(order.items ?? []).length > 3 && <p>+{(order.items ?? []).length - 3} more</p>}
      </div>

      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm">{formatCurrency(order.total_amount)}</span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onClick}
            title="View details"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          {nextStatus && (
            <Button
              size="sm"
              className="h-7 text-xs"
              onClick={() => onStatusChange(nextStatus)}
            >
              {ACTION_LABELS[order.status] ?? "Advance"}
            </Button>
          )}
          {order.status !== "cancelled" && !["delivered", "picked_up"].includes(order.status) && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => onStatusChange("cancelled")}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
