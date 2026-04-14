"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Elements } from "@stripe/react-stripe-js"
import { toast } from "sonner"
import { checkoutSchema } from "@/lib/validations"
import { useCart } from "@/hooks/useCart"
import { useCartStore } from "@/store/cartStore"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { StripePaymentForm } from "./StripePaymentForm"
import { loadStripe } from "@stripe/stripe-js"
import type { z } from "zod"
import type { CreateCashOrderRequest, CreatePaymentIntentResponse } from "@/types/api"

type FormData = z.infer<typeof checkoutSchema>

interface Props {
  restaurant: {
    id: string
    name: string
    slug: string
    delivery_fee: number
    min_order_amount: number
    tax_rate: number
    accepts_delivery: boolean
    accepts_pickup: boolean
    stripe_publishable_key: string | null
  }
}

export function CheckoutForm({ restaurant }: Props) {
  const router = useRouter()
  const { items, subtotal, discountAmount, promoCode, promoCodeId, clearCart, restaurantSlug } = useCart()
  const [loading, setLoading] = useState(false)
  const [paymentIntentData, setPaymentIntentData] = useState<CreatePaymentIntentResponse | null>(null)
  const [stripePromise] = useState(() =>
    restaurant.stripe_publishable_key ? loadStripe(restaurant.stripe_publishable_key) : null
  )

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      order_type: restaurant.accepts_delivery ? "delivery" : "pickup",
      payment_type: restaurant.stripe_publishable_key ? "stripe" : "cash",
    },
  })

  const orderType = watch("order_type")
  const paymentType = watch("payment_type")

  // Redirect if wrong restaurant or empty cart
  if (restaurantSlug !== restaurant.slug || items.length === 0) {
    router.push(`/${restaurant.slug}`)
    return null
  }

  const effectiveSubtotal = Math.max(0, subtotal - discountAmount)
  const deliveryFee = orderType === "delivery" ? restaurant.delivery_fee : 0
  const tax = effectiveSubtotal * restaurant.tax_rate
  const total = effectiveSubtotal + deliveryFee + tax

  const buildCartItems = () =>
    items.map((item) => ({
      menu_item_id: item.menu_item_id,
      quantity: item.quantity,
      choices: item.choices.map((c) => ({ choice_id: c.choice_id, option_id: c.option_id })),
      special_instructions: item.special_instructions,
    }))

  const onSubmit = async (data: FormData) => {
    if (data.payment_type === "stripe") {
      setLoading(true)
      try {
        const res = await fetch(`/api/stripe/create-payment-intent/${restaurant.slug}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: buildCartItems(),
            promo_code: promoCode || undefined,
            order_type: data.order_type,
            contact: data.contact,
            delivery_address: data.delivery_address,
            special_instructions: data.special_instructions,
          }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || "Failed to create payment")
        setPaymentIntentData(json)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Checkout failed")
      } finally {
        setLoading(false)
      }
    } else {
      // Cash on delivery
      setLoading(true)
      try {
        const body: CreateCashOrderRequest = {
          restaurant_id: restaurant.id,
          items: buildCartItems(),
          promo_code: promoCode || undefined,
          order_type: data.order_type,
          delivery_address: data.delivery_address,
          contact: data.contact,
          special_instructions: data.special_instructions,
        }
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || "Order failed")
        clearCart()
        router.push(`/${restaurant.slug}/order/confirmation?order_id=${json.order_id}`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Order failed")
      } finally {
        setLoading(false)
      }
    }
  }

  // Show Stripe payment form after PaymentIntent is created
  if (paymentIntentData && stripePromise) {
    return (
      <Elements
        stripe={stripePromise}
        options={{ clientSecret: paymentIntentData.client_secret, appearance: { theme: "stripe" } }}
      >
        <StripePaymentForm
          restaurant={restaurant}
          paymentIntentData={paymentIntentData}
          onSuccess={(orderId) => {
            clearCart()
            router.push(`/${restaurant.slug}/order/confirmation?order_id=${orderId}`)
          }}
          onBack={() => setPaymentIntentData(null)}
        />
      </Elements>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {/* Order type */}
            {restaurant.accepts_delivery && restaurant.accepts_pickup && (
              <Card>
                <CardHeader><CardTitle className="text-base">Order type</CardTitle></CardHeader>
                <CardContent>
                  <RadioGroup defaultValue="delivery" {...register("order_type")} className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                      <RadioGroupItem value="delivery" id="delivery" />
                      <Label htmlFor="delivery" className="cursor-pointer font-medium">🛵 Delivery</Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup" className="cursor-pointer font-medium">🏪 Pickup</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            )}

            {/* Contact */}
            <Card>
              <CardHeader><CardTitle className="text-base">Contact details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Full name</Label>
                  <Input {...register("contact.name")} />
                  {errors.contact?.name && <p className="text-sm text-destructive">{errors.contact.name.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" {...register("contact.email")} />
                    {errors.contact?.email && <p className="text-sm text-destructive">{errors.contact.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input type="tel" {...register("contact.phone")} />
                    {errors.contact?.phone && <p className="text-sm text-destructive">{errors.contact.phone.message}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery address */}
            {orderType === "delivery" && (
              <Card>
                <CardHeader><CardTitle className="text-base">Delivery address</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Street address</Label>
                    <Input {...register("delivery_address.address_line1")} />
                    {errors.delivery_address?.address_line1 && (
                      <p className="text-sm text-destructive">{errors.delivery_address.address_line1.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Apartment, suite, etc. <span className="text-muted-foreground">(optional)</span></Label>
                    <Input {...register("delivery_address.address_line2")} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input {...register("delivery_address.city")} />
                      {errors.delivery_address?.city && <p className="text-sm text-destructive">{errors.delivery_address.city.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Input {...register("delivery_address.state")} />
                      {errors.delivery_address?.state && <p className="text-sm text-destructive">{errors.delivery_address.state.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Zip code</Label>
                    <Input {...register("delivery_address.postal_code")} className="max-w-xs" />
                    {errors.delivery_address?.postal_code && <p className="text-sm text-destructive">{errors.delivery_address.postal_code.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Delivery notes <span className="text-muted-foreground">(optional)</span></Label>
                    <Input placeholder="Leave at door, ring bell…" {...register("delivery_address.delivery_notes")} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment method */}
            {restaurant.stripe_publishable_key && (
              <Card>
                <CardHeader><CardTitle className="text-base">Payment</CardTitle></CardHeader>
                <CardContent>
                  <RadioGroup defaultValue="stripe" {...register("payment_type")} className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                      <RadioGroupItem value="stripe" id="pay-stripe" />
                      <Label htmlFor="pay-stripe" className="cursor-pointer font-medium">💳 Pay online</Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                      <RadioGroupItem value="cash" id="pay-cash" />
                      <Label htmlFor="pay-cash" className="cursor-pointer font-medium">💵 Cash on {orderType === "delivery" ? "delivery" : "pickup"}</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            )}

            {/* Special instructions */}
            <Card>
              <CardHeader><CardTitle className="text-base">Special instructions <span className="font-normal text-muted-foreground">(optional)</span></CardTitle></CardHeader>
              <CardContent>
                <Textarea placeholder="Any notes for the restaurant…" {...register("special_instructions")} rows={2} />
              </CardContent>
            </Card>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <Card className="sticky top-24">
              <CardHeader><CardTitle className="text-base">Order summary</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.quantity}× {item.name}</span>
                    <span>{formatCurrency(item.total_price)}</span>
                  </div>
                ))}
                <Separator />
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                  {discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(discountAmount)}</span></div>}
                  <div className="flex justify-between text-muted-foreground"><span>Delivery</span><span>{deliveryFee === 0 ? "Free" : formatCurrency(deliveryFee)}</span></div>
                  <div className="flex justify-between text-muted-foreground"><span>Tax</span><span>{formatCurrency(tax)}</span></div>
                  <Separator />
                  <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatCurrency(total)}</span></div>
                </div>
                <Button type="submit" className="w-full mt-4" size="lg" disabled={loading}>
                  {loading ? "Processing…" : paymentType === "stripe" ? "Continue to payment" : "Place order"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
