import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ORDER_STATUSES } from "@/lib/constants"

type Order = { id: string; order_number: number; total_amount: number; status: string; order_type: string; created_at: string; guest_name: string | null }

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-blue-100 text-blue-800",
  preparing: "bg-orange-100 text-orange-800",
  ready: "bg-green-100 text-green-800",
  delivered: "bg-gray-100 text-gray-700",
  picked_up: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-800",
}

export function RecentOrders({ orders, restaurantSlug }: { orders: Order[]; restaurantSlug: string }) {
  if (orders.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const statusLabel = ORDER_STATUSES.find((s) => s.value === order.status)?.label ?? order.status
        return (
          <Link
            key={order.id}
            href={`/${restaurantSlug}/admin/orders`}
            className="flex items-center justify-between hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
          >
            <div>
              <p className="text-sm font-medium">#{order.order_number} · {order.guest_name ?? "Guest"}</p>
              <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{formatCurrency(order.total_amount)}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status] ?? "bg-gray-100 text-gray-700"}`}>
                {statusLabel}
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
