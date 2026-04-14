"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingBag, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CartButton } from "@/components/customer/cart/CartButton"
import { CartSheet } from "@/components/customer/cart/CartSheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface Props {
  restaurant: { id: string; name: string; slug: string; logo_url: string | null }
}

export function CustomerHeader({ restaurant }: Props) {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success("Signed out")
    router.refresh()
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href={`/${restaurant.slug}`} className="flex items-center gap-3 min-w-0">
            {restaurant.logo_url ? (
              <Image src={restaurant.logo_url} alt={restaurant.name} width={32} height={32} className="rounded-full object-cover h-8 w-8" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-blue-600" />
              </div>
            )}
            <span className="font-semibold text-gray-900 truncate">{restaurant.name}</span>
          </Link>

          <div className="flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/${restaurant.slug}/account`}>My account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/${restaurant.slug}/account/orders`}>Order history</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/sign-in?returnTo=/${restaurant.slug}`}>Sign in</Link>
              </Button>
            )}
            <CartButton restaurantSlug={restaurant.slug} />
          </div>
        </div>
      </header>
      <CartSheet restaurantSlug={restaurant.slug} />
    </>
  )
}
