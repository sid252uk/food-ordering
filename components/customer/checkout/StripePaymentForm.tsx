"use client"

import { useState } from "react"
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { ChevronLeft } from "lucide-react"
import type { CreatePaymentIntentResponse } from "@/types/api"

interface Props {
  restaurant: { slug: string; name: string }
  paymentIntentData: CreatePaymentIntentResponse
  onSuccess: (orderId: string) => void
  onBack: () => void
}

export function StripePaymentForm({ restaurant, paymentIntentData, onSuccess, onBack }: Props) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message ?? "Payment failed")
      setLoading(false)
      return
    }

    const returnUrl = `${window.location.origin}/${restaurant.slug}/order/confirmation?payment_intent_id=${paymentIntentData.payment_intent_id}`

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      clientSecret: paymentIntentData.client_secret,
      confirmParams: { return_url: returnUrl },
    })

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed")
      setLoading(false)
    }
    // On success, Stripe redirects to the return_url
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="h-4 w-4" /> Back to details
      </button>
      <h1 className="text-2xl font-bold mb-6">Payment</h1>

      <Card className="mb-4">
        <CardHeader><CardTitle className="text-base">Order total</CardTitle></CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{formatCurrency(paymentIntentData.breakdown.total)}</p>
          <p className="text-sm text-muted-foreground mt-1">to {restaurant.name}</p>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="pt-6">
            <PaymentElement />
            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full mt-6" size="lg" disabled={loading || !stripe}>
              {loading ? "Processing payment…" : `Pay ${formatCurrency(paymentIntentData.breakdown.total)}`}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
