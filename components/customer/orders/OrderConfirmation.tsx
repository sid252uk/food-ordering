"use client"

import { useEffect } from "react"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCartStore } from "@/store/cartStore"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { OrderWithItems } from "@/types"

export function OrderConfirmation({ order }: { order: OrderWithItems }) {
  const clearCart = useCartStore((s) => s.clearCart)

  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <div className="max-w-lg mx-auto px-4 py-12 text-center">
      <div className="flex justify-center mb-4">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Order confirmed!</h1>
      <p className="text-muted-foreground mb-8">
        Your order #{order.order_number} has been placed successfully.{" "}
        {order.guest_email && `A confirmation will be sent to ${order.guest_email}.`}
      </p>

      <Card className="text-left mb-6">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Order number</span>
            <span className="font-medium">#{order.order_number}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Placed at</span>
            <span>{formatDate(order.created_at)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Order type</span>
            <span className="capitalize">{order.order_type}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment</span>
            <span className="capitalize">{order.payment_type === "cash" ? "Cash on delivery" : "Card"}</span>
          </div>
          <Separator />
          {order.items?.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.quantity}× {(item.menu_item_snapshot as { name?: string })?.name ?? "Item"}</span>
              <span>{formatCurrency(item.total_price)}</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>{formatCurrency(order.total_amount)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <Link href={`/${order.restaurant.slug}/order/${order.id}`}>
          <Button className="w-full">Track my order</Button>
        </Link>
        <Link href={`/${order.restaurant.slug}`}>
          <Button variant="outline" className="w-full">Back to menu</Button>
        </Link>
      </div>
    </div>
  )
}
