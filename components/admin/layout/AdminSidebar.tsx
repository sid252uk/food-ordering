"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ClipboardList, UtensilsCrossed, Tag, Settings, ExternalLink, ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "admin" },
  { label: "Orders", icon: ClipboardList, href: "admin/orders" },
  { label: "Menu", icon: UtensilsCrossed, href: "admin/menu" },
  { label: "Promo Codes", icon: Tag, href: "admin/promos" },
  { label: "Settings", icon: Settings, href: "admin/settings" },
]

interface Props {
  restaurant: { slug: string; name: string }
}

export function AdminSidebar({ restaurant }: Props) {
  const pathname = usePathname()

  return (
    <>
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 bg-gray-900 text-white z-40">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
          <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <ShoppingBag className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{restaurant.name}</p>
            <p className="text-xs text-gray-400">Admin panel</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const href = `/${restaurant.slug}/${item.href}`
            const isActive = pathname === href || (item.href !== "admin" && pathname.startsWith(href))
            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-gray-800">
          <Link
            href={`/${restaurant.slug}`}
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            View live menu
          </Link>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-gray-900 text-white px-4 h-14 flex items-center justify-between">
        <span className="font-semibold">{restaurant.name} · Admin</span>
        <div className="flex gap-1">
          {navItems.map((item) => {
            const href = `/${restaurant.slug}/${item.href}`
            const isActive = pathname === href || (item.href !== "admin" && pathname.startsWith(href))
            return (
              <Link
                key={item.href}
                href={href}
                className={cn("p-2 rounded", isActive ? "text-blue-400" : "text-gray-400")}
                title={item.label}
              >
                <item.icon className="h-5 w-5" />
              </Link>
            )
          })}
        </div>
      </div>
      <div className="lg:hidden h-14" />
    </>
  )
}
