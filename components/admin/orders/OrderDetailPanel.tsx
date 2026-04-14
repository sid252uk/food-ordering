import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ORDER_STATUSES } from "@/lib/constants"
import type { OrderWithItems } from "@/types"

interface Props {
  order: OrderWithItems
  onClose: () => void
  onStatusChange: (status: string) => void
}

export function OrderDetailPanel({ order, onClose, onStatusChange }: Props) {
  const statusLabel = ORDER_STATUSES.find((s) => s.value === order.status)?.label ?? order.status
  const address = order.delivery_address_snapshot ? JSON.parse(order.delivery_address_snapshot as unknown as string) : null

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Order #{order.order_number}</SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-muted-foreground text-xs">Status</p><Badge>{statusLabel}</Badge></div>
            <div><p className="text-muted-foreground text-xs">Type</p><p className="capitalize font-medium">{order.order_type}</p></div>
            <div><p className="text-muted-foreground text-xs">Customer</p><p className="font-medium">{order.guest_name ?? "Guest"}</p></div>
            <div><p className="text-muted-foreground text-xs">Payment</p><p className="capitalize font-medium">{order.payment_type === "cash" ? "Cash on delivery" : "Card"}</p></div>
            <div><p className="text-muted-foreground text-xs">Email</p><p className="font-medium truncate">{order.guest_email ?? "—"}</p></div>
            <div><p className="text-muted-foreground text-xs">Phone</p><p className="font-medium">{order.guest_phone ?? "—"}</p></div>
            <div><p className="text-muted-foreground text-xs">Placed at</p><p className="font-medium">{formatDate(order.created_at)}</p></div>
          </div>

          {address && (
            <>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Delivery address</p>
                <p className="text-sm">{address.address_line1}</p>
                {address.address_line2 && <p className="text-sm">{address.address_line2}</p>}
                <p className="text-sm">{address.city}, {address.state} {address.postal_code}</p>
                {address.delivery_notes && <p className="text-xs text-muted-foreground mt-1">Note: {address.delivery_notes}</p>}
              </div>
            </>
          )}

          {order.special_instructions && (
            <>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Special instructions</p>
                <p className="text-sm italic">"{order.special_instructions}"</p>
              </div>
            </>
          )}

          <Separator />

          {/* Items */}
          <div>
            <p className="font-semibold mb-3">Items</p>
            <div className="space-y-3">
              {(order.items ?? []).map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.quantity}× {(item.menu_item_snapshot as { name?: string })?.name ?? "Item"}</span>
                    <span>{formatCurrency(item.total_price)}</span>
                  </div>
                  {(item.choices ?? []).length > 0 && (
                    <p className="text-xs text-muted-foreground ml-4">
                      {item.choices.map((c) => c.choice_name).join(", ")}
                    </p>
                  )}
                  {item.special_instructions && (
                    <p className="text-xs text-muted-foreground ml-4 italic">"{item.special_instructions}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
            {order.discount_amount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(order.discount_amount)}</span></div>}
            <div className="flex justify-between text-muted-foreground"><span>Delivery</span><span>{formatCurrency(order.delivery_fee)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Tax</span><span>{formatCurrency(order.tax_amount)}</span></div>
            {order.tip_amount > 0 && <div className="flex justify-between text-muted-foreground"><span>Tip</span><span>{formatCurrency(order.tip_amount)}</span></div>}
            <Separator />
            <div className="flex justify-between font-bold"><span>Total</span><span>{formatCurrency(order.total_amount)}</span></div>
          </div>

          {/* Actions */}
          {!["delivered", "picked_up", "cancelled", "refunded"].includes(order.status) && (
            <>
              <Separator />
              <div className="flex gap-2">
                {order.status !== "ready" && (
                  <Button
                    className="flex-1"
                    onClick={() => onStatusChange(
                      order.status === "pending" ? "accepted" :
                      order.status === "accepted" ? "preparing" :
                      order.status === "preparing" ? "ready" : "delivered"
                    )}
                  >
                    {order.status === "pending" ? "Accept order" :
                     order.status === "accepted" ? "Start preparing" :
                     order.status === "preparing" ? "Mark ready" : "Complete"}
                  </Button>
                )}
                {order.status === "ready" && (
                  <Button className="flex-1" onClick={() => onStatusChange(order.order_type === "pickup" ? "picked_up" : "delivered")}>
                    Mark as {order.order_type === "pickup" ? "picked up" : "delivered"}
                  </Button>
                )}
                <Button variant="outline" className="text-destructive border-destructive/30" onClick={() => onStatusChange("cancelled")}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
