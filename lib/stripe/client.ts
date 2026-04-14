import { loadStripe } from "@stripe/stripe-js"

let stripePromise: ReturnType<typeof loadStripe> | null = null

export function getStripeClient(publishableKey: string) {
  stripePromise = loadStripe(publishableKey)
  return stripePromise
}
