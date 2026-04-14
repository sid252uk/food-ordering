import { createClient } from "@/lib/supabase/server"
import { formatCurrency, formatDate } from "@/lib/utils"
import { StatusBadge } from "@/components/shared/StatusBadge"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import type { OrderStatus } from "@/lib/constants"

export default async function OrderHistoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: restaurant } = await supabase.from("restaurants").select("id").eq("slug", slug).single()
  if (!restaurant) return null

  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, order_type, payment_type, subtotal, delivery_fee, discount_amount, tax_amount, total_amount, created_at, order_items(id, quantity, unit_price, menu_item_snapshot)")
    .eq("customer_id", user.id)
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: false })
    .limit(50)

  if (!orders || orders.length === 0) {
    return (
      <div>
        <h2 className="font-semibold text-lg mb-4">Order history</h2>
        <p className="text-sm text-muted-foreground text-center py-12">No orders yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-lg">Order history</h2>
      {orders.map((order) => {
        const itemNames = order.order_items
          .map((i) => {
            const snap = i.menu_item_snapshot as { name?: string } | null
            return snap?.name ?? "Item"
          })
          .join(", ")

        return (
          <Link
            key={order.id}
            href={`/${slug}/order/${order.id}`}
            className="block bg-white border rounded-lg px-4 py-3 hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={order.status as OrderStatus} />
                  <span className="text-xs text-muted-foreground capitalize">{order.order_type}</span>
                </div>
                <p className="text-sm font-medium truncate">{itemNames}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(order.created_at)} · {formatCurrency(order.total_amount)}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          </Link>
        )
      })}
    </div>
  )
}
