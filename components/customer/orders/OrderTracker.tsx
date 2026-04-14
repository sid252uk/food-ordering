"use client"

import Link from "next/link"
import { useOrder } from "@/hooks/useOrders"
import { useRealtimeOrder } from "@/hooks/useRealtimeOrder"
import { ORDER_STATUSES } from "@/lib/constants"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Circle, Clock } from "lucide-react"
import type { OrderWithItems } from "@/types"

const TRACKER_STEPS = ["pending", "accepted", "preparing", "ready", "delivered"]
const PICKUP_STEPS = ["pending", "accepted", "preparing", "ready", "picked_up"]

const STATUS_MESSAGES: Record<string, string> = {
  pending: "Your order has been placed and is waiting to be accepted.",
  accepted: "Great! The restaurant has accepted your order.",
  preparing: "Your order is being prepared in the kitchen.",
  ready: "Your order is ready! It will be with you shortly.",
  out_for_delivery: "Your order is on its way!",
  delivered: "Your order has been delivered. Enjoy!",
  picked_up: "Order picked up. Enjoy your meal!",
  cancelled: "Your order has been cancelled.",
  refunded: "Your order has been refunded.",
}

export function OrderTracker({ initialOrder }: { initialOrder: OrderWithItems }) {
  const { data: order } = useOrder(initialOrder.id)
  const currentOrder = order ?? initialOrder
  useRealtimeOrder(currentOrder.id)

  const steps = currentOrder.order_type === "pickup" ? PICKUP_STEPS : TRACKER_STEPS
  const currentStepIndex = steps.indexOf(currentOrder.status)
  const isCancelled = currentOrder.status === "cancelled" || currentOrder.status === "refunded"

  const statusInfo = ORDER_STATUSES.find((s) => s.value === currentOrder.status)

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Order #{currentOrder.order_number}</p>
        <h1 className="text-2xl font-bold mt-1">Track your order</h1>
      </div>

      {/* Status */}
      <Card className="mb-6">
        <CardContent className="p-6 text-center">
          <Badge
            className="mb-3 text-sm"
            variant={isCancelled ? "destructive" : "default"}
          >
            {statusInfo?.label ?? currentOrder.status}
          </Badge>
          <p className="text-muted-foreground text-sm">
            {STATUS_MESSAGES[currentOrder.status] ?? "Status updated."}
          </p>
        </CardContent>
      </Card>

      {/* Progress steps */}
      {!isCancelled && (
        <div className="mb-6">
          {steps.map((step, idx) => {
            const done = idx <= currentStepIndex
            const active = idx === currentStepIndex
            return (
              <div key={step} className="flex items-start gap-3 pb-4">
                <div className="flex flex-col items-center">
                  {done ? (
                    <CheckCircle2 className={`h-6 w-6 ${active ? "text-blue-600" : "text-green-500"}`} />
                  ) : (
                    <Circle className="h-6 w-6 text-gray-300" />
                  )}
                  {idx < steps.length - 1 && (
                    <div className={`w-0.5 h-6 mt-1 ${done ? "bg-green-400" : "bg-gray-200"}`} />
                  )}
                </div>
                <div className="pt-0.5">
                  <p className={`text-sm font-medium ${done ? "text-gray-900" : "text-gray-400"}`}>
                    {ORDER_STATUSES.find((s) => s.value === step)?.label ?? step}
                  </p>
                  {active && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <Clock className="inline h-3 w-3 mr-1" />
                      {currentOrder.estimated_ready_at
                        ? `Est. ${formatDate(currentOrder.estimated_ready_at)}`
                        : "In progress…"}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Order summary */}
      <Card>
        <CardContent className="p-6 space-y-3">
          <p className="font-semibold">Order summary</p>
          {currentOrder.items?.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.quantity}× {(item.menu_item_snapshot as { name?: string })?.name ?? "Item"}</span>
              <span>{formatCurrency(item.total_price)}</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>{formatCurrency(currentOrder.total_amount)}</span>
          </div>
        </CardContent>
      </Card>

      <Link href={`/${currentOrder.restaurant.slug}`} className="block mt-6">
        <Button variant="outline" className="w-full">Back to menu</Button>
      </Link>
    </div>
  )
}
