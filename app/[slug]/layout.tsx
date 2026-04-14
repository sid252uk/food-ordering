import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CustomerHeader } from "@/components/customer/layout/CustomerHeader"

export default async function RestaurantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name, slug, logo_url, is_active")
    .eq("slug", slug)
    .single()

  if (!restaurant || !restaurant.is_active) notFound()

  return (
    <div className="min-h-screen flex flex-col">
      <CustomerHeader restaurant={restaurant} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
