"use client"

import { useState } from "react"
import { useAdminOrders, useUpdateOrderStatus } from "@/hooks/useOrders"
import { useRealtimeOrderQueue } from "@/hooks/useRealtimeOrderQueue"
import { OrderQueueCard } from "./OrderQueueCard"
import { OrderDetailPanel } from "./OrderDetailPanel"
import { formatDate } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import type { OrderWithItems } from "@/types"

const COLUMNS = [
  { status: "pending", label: "Pending" },
  { status: "preparing", label: "Preparing" },
  { status: "ready", label: "Ready" },
]

export function OrderQueue({ restaurant }: { restaurant: { id: string; name: string; slug: string } }) {
  const { data: orders, isLoading } = useAdminOrders(restaurant.id)
  const { mutate: updateStatus } = useUpdateOrderStatus(restaurant.id)
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null)
  useRealtimeOrderQueue(restaurant.id)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => <Skeleton key={n} className="h-48 rounded-lg" />)}
        </div>
      </div>
    )
  }

  const activeOrders = (orders ?? []).filter((o) => !["delivered", "picked_up", "cancelled", "refunded"].includes(o.status))
  const historicalOrders = (orders ?? []).filter((o) => ["delivered", "picked_up", "cancelled", "refunded"].includes(o.status))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <span className="text-sm text-muted-foreground">{activeOrders.length} active</span>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const colOrders = activeOrders.filter((o) => {
            if (col.status === "pending") return o.status === "pending" || o.status === "accepted"
            return o.status === col.status
          })
          return (
            <div key={col.status}>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="font-semibold text-gray-700">{col.label}</h2>
                <span className="text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5">{colOrders.length}</span>
              </div>
              <div className="space-y-3 min-h-[200px]">
                {colOrders.map((order) => (
                  <OrderQueueCard
                    key={order.id}
                    order={order}
                    onStatusChange={(status) => updateStatus({ orderId: order.id, status })}
                    onClick={() => setSelectedOrder(order)}
                  />
                ))}
                {colOrders.length === 0 && (
                  <div className="border-2 border-dashed rounded-lg p-6 text-center text-sm text-muted-foreground">
                    No {col.label.toLowerCase()} orders
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* History */}
      {historicalOrders.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-700 mb-3">Completed & Cancelled</h2>
          <div className="space-y-2">
            {historicalOrders.slice(0, 20).map((order) => (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="w-full text-left bg-gray-50 hover:bg-gray-100 rounded-lg px-4 py-3 flex justify-between items-center transition-colors"
              >
                <span className="text-sm">#{order.order_number} · {order.guest_name ?? "Guest"}</span>
                <span className="text-xs text-muted-foreground">{formatDate(order.created_at)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedOrder && (
        <OrderDetailPanel
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={(status) => { updateStatus({ orderId: selectedOrder.id, status }); setSelectedOrder(null) }}
        />
      )}
    </div>
  )
}
