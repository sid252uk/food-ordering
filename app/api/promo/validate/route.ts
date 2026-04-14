import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { ValidatePromoRequest, ValidatePromoResponse } from "@/types/api"

export async function POST(request: Request) {
  try {
    const body: ValidatePromoRequest = await request.json()
    const { code, restaurant_id, subtotal } = body

    if (!code || !restaurant_id || subtotal === undefined) {
      return NextResponse.json({ valid: false, discount_amount: 0, error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: promo, error } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("restaurant_id", restaurant_id)
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single()

    if (error || !promo) {
      return NextResponse.json<ValidatePromoResponse>({ valid: false, discount_amount: 0, error: "Invalid promo code" })
    }

    const now = new Date()
    if (promo.starts_at && new Date(promo.starts_at) > now) {
      return NextResponse.json<ValidatePromoResponse>({ valid: false, discount_amount: 0, error: "Promo code not yet active" })
    }
    if (promo.expires_at && new Date(promo.expires_at) < now) {
      return NextResponse.json<ValidatePromoResponse>({ valid: false, discount_amount: 0, error: "Promo code has expired" })
    }
    if (promo.max_uses !== null && promo.current_uses >= promo.max_uses) {
      return NextResponse.json<ValidatePromoResponse>({ valid: false, discount_amount: 0, error: "Promo code usage limit reached" })
    }
    if (promo.min_order_amount !== null && subtotal < promo.min_order_amount) {
      return NextResponse.json<ValidatePromoResponse>({
        valid: false,
        discount_amount: 0,
        error: `Minimum order of $${promo.min_order_amount} required`,
      })
    }

    let discount_amount = 0
    if (promo.promo_type === "percentage") {
      discount_amount = subtotal * (promo.discount_value / 100)
    } else {
      discount_amount = Math.min(promo.discount_value, subtotal)
    }

    return NextResponse.json<ValidatePromoResponse>({
      valid: true,
      discount_amount: Math.round(discount_amount * 100) / 100,
      promo_code_id: promo.id,
    })
  } catch (err) {
    console.error("[promo/validate]", err)
    return NextResponse.json<ValidatePromoResponse>({ valid: false, discount_amount: 0, error: "Server error" }, { status: 500 })
  }
}
