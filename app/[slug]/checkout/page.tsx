import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { CheckoutForm } from "@/components/customer/checkout/CheckoutForm"

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name, slug, delivery_fee, min_order_amount, tax_rate, accepts_delivery, accepts_pickup, stripe_publishable_key")
    .eq("slug", slug)
    .single()

  if (!restaurant) notFound()

  return <CheckoutForm restaurant={restaurant} />
}
