import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { User, MapPin, ShoppingBag } from "lucide-react"

export default async function AccountLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${slug}/sign-in?returnTo=/${slug}/account`)
  }

  const navItems = [
    { href: `/${slug}/account`, label: "Profile", icon: User },
    { href: `/${slug}/account/addresses`, label: "Addresses", icon: MapPin },
    { href: `/${slug}/account/orders`, label: "Order history", icon: ShoppingBag },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My account</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <nav className="md:w-48 shrink-0">
          <ul className="space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
