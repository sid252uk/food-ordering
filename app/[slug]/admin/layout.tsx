import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar"

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/sign-in?returnTo=/${slug}/admin`)

  // Verify ownership
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name, slug")
    .eq("slug", slug)
    .eq("owner_user_id", user.id)
    .single()

  if (!restaurant) redirect(`/${slug}`)

  return (
    <div className="min-h-screen flex">
      <AdminSidebar restaurant={restaurant} />
      <div className="flex-1 min-w-0 lg:ml-64">
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
