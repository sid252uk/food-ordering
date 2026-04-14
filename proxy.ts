import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user, supabase } = await updateSession(request)

  const { pathname } = request.nextUrl

  // Match paths like /:slug/admin or /:slug/admin/...
  // e.g. /my-restaurant/admin, /my-restaurant/admin/menu
  const adminRouteMatch = pathname.match(/^\/([^/]+)\/admin(\/.*)?$/)

  if (adminRouteMatch) {
    const slug = adminRouteMatch[1]

    // 1. Not authenticated — redirect to sign-in with returnTo
    if (!user) {
      const signInUrl = new URL("/sign-in", request.url)
      signInUrl.searchParams.set("returnTo", pathname)
      return NextResponse.redirect(signInUrl)
    }

    // 2. Check that the user has the restaurant_owner role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "restaurant_owner") {
      const menuUrl = new URL(`/${slug}`, request.url)
      return NextResponse.redirect(menuUrl)
    }

    // 3. Check that a restaurant exists for this slug owned by this user
    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("id")
      .eq("slug", slug)
      .eq("owner_user_id", user.id)
      .single()

    if (!restaurant) {
      const menuUrl = new URL(`/${slug}`, request.url)
      return NextResponse.redirect(menuUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static  (static files)
     * - _next/image   (image optimization)
     * - favicon.ico
     * - image files (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
