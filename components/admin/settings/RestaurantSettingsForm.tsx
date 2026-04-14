"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/lib/supabase/client"
import { restaurantSettingsSchema } from "@/lib/validations"
import { useUpload } from "@/hooks/useUpload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { DAYS_OF_WEEK } from "@/lib/constants"
import type { z } from "zod"
import type { Database } from "@/types/database.types"

type Restaurant = Database["public"]["Tables"]["restaurants"]["Row"]
type FormData = z.infer<typeof restaurantSettingsSchema>

interface OperatingHoursDay {
  open: string
  close: string
  closed: boolean
}

export function RestaurantSettingsForm({ restaurant }: { restaurant: Restaurant }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(restaurant.logo_url)
  const [hours, setHours] = useState<Record<string, OperatingHoursDay>>(() => {
    const stored = restaurant.operating_hours as Record<string, OperatingHoursDay> | null
    if (stored && typeof stored === "object") return stored
    return Object.fromEntries(
      DAYS_OF_WEEK.map((d) => [d, { open: "09:00", close: "22:00", closed: false }])
    )
  })
  const [stripeSecret, setStripeSecret] = useState("")
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState("")
  const [saving, setSaving] = useState(false)

  const { upload, isUploading } = useUpload({ bucket: "restaurant-logos", folder: restaurant.id })

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(restaurantSettingsSchema),
    defaultValues: {
      name: restaurant.name,
      description: restaurant.description ?? "",
      phone: restaurant.phone ?? "",
      email: restaurant.email ?? "",
      address_line1: restaurant.address_line1 ?? "",
      address_line2: restaurant.address_line2 ?? "",
      city: restaurant.city ?? "",
      state: restaurant.state ?? "",
      postal_code: restaurant.postal_code ?? "",
      country: restaurant.country ?? "US",
      accepts_delivery: restaurant.accepts_delivery,
      accepts_pickup: restaurant.accepts_pickup,
      delivery_fee: restaurant.delivery_fee,
      min_order_amount: restaurant.min_order_amount,
      estimated_delivery_minutes: restaurant.estimated_delivery_minutes,
      estimated_pickup_minutes: restaurant.estimated_pickup_minutes,
      tax_rate: restaurant.tax_rate,
      stripe_publishable_key: restaurant.stripe_publishable_key ?? "",
      timezone: restaurant.timezone,
    },
  })

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    const supabase = createClient()

    const updateData: Record<string, unknown> = {
      name: data.name,
      description: data.description || null,
      phone: data.phone || null,
      email: data.email || null,
      address_line1: data.address_line1 || null,
      address_line2: data.address_line2 || null,
      city: data.city || null,
      state: data.state || null,
      postal_code: data.postal_code || null,
      country: data.country || null,
      accepts_delivery: data.accepts_delivery,
      accepts_pickup: data.accepts_pickup,
      delivery_fee: data.delivery_fee,
      min_order_amount: data.min_order_amount,
      estimated_delivery_minutes: data.estimated_delivery_minutes,
      estimated_pickup_minutes: data.estimated_pickup_minutes,
      tax_rate: data.tax_rate,
      stripe_publishable_key: data.stripe_publishable_key || null,
      operating_hours: hours,
      logo_url: logoUrl,
      timezone: data.timezone,
    }

    // Only update encrypted keys if new values were entered
    if (stripeSecret.trim()) {
      // Simple base64 encoding — replace with real encryption if ENCRYPTION_KEY is configured
      updateData.stripe_secret_key_encrypted = Buffer.from(stripeSecret).toString("base64")
    }
    if (stripeWebhookSecret.trim()) {
      updateData.stripe_webhook_secret_encrypted = Buffer.from(stripeWebhookSecret).toString("base64")
    }

    const { error } = await supabase.from("restaurants").update(updateData).eq("id", restaurant.id)
    setSaving(false)

    if (error) {
      toast.error("Failed to save settings: " + error.message)
    } else {
      toast.success("Settings saved")
      setStripeSecret("")
      setStripeWebhookSecret("")
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await upload(file)
    if (url) setLogoUrl(url)
  }

  const updateHours = (day: string, field: keyof OperatingHoursDay, value: string | boolean) => {
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button type="submit" disabled={saving || isUploading}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>

      {/* Business Info */}
      <section className="space-y-4">
        <h2 className="font-semibold text-lg">Business info</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
            <Label>Restaurant name</Label>
            <Input {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Description <span className="text-muted-foreground">(optional)</span></Label>
            <Textarea {...register("description")} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Phone <span className="text-muted-foreground">(optional)</span></Label>
            <Input {...register("phone")} type="tel" />
          </div>
          <div className="space-y-2">
            <Label>Email <span className="text-muted-foreground">(optional)</span></Label>
            <Input {...register("email")} type="email" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Logo</Label>
          <div className="flex items-center gap-3">
            {logoUrl && <img src={logoUrl} alt="Logo" className="h-12 w-12 rounded-lg object-cover border" />}
            <Input type="file" accept="image/*" onChange={handleLogoUpload} disabled={isUploading} className="max-w-xs" />
            {isUploading && <span className="text-sm text-muted-foreground">Uploading…</span>}
          </div>
        </div>
      </section>

      <Separator />

      {/* Address */}
      <section className="space-y-4">
        <h2 className="font-semibold text-lg">Address</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
            <Label>Street address</Label>
            <Input {...register("address_line1")} placeholder="123 Main St" />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Apt / Suite <span className="text-muted-foreground">(optional)</span></Label>
            <Input {...register("address_line2")} placeholder="Suite 100" />
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <Input {...register("city")} />
          </div>
          <div className="space-y-2">
            <Label>State / Province</Label>
            <Input {...register("state")} />
          </div>
          <div className="space-y-2">
            <Label>Postal code</Label>
            <Input {...register("postal_code")} />
          </div>
          <div className="space-y-2">
            <Label>Country</Label>
            <Input {...register("country")} />
          </div>
        </div>
      </section>

      <Separator />

      {/* Order Settings */}
      <section className="space-y-4">
        <h2 className="font-semibold text-lg">Order settings</h2>
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <Switch checked={watch("accepts_delivery")} onCheckedChange={(v) => setValue("accepts_delivery", v)} />
            <span className="text-sm font-medium">Accept delivery orders</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <Switch checked={watch("accepts_pickup")} onCheckedChange={(v) => setValue("accepts_pickup", v)} />
            <span className="text-sm font-medium">Accept pickup orders</span>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Delivery fee ($)</Label>
            <Input type="number" step="0.01" min="0" {...register("delivery_fee", { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label>Minimum order ($)</Label>
            <Input type="number" step="0.01" min="0" {...register("min_order_amount", { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label>Estimated delivery time (mins)</Label>
            <Input type="number" min="1" {...register("estimated_delivery_minutes", { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label>Estimated pickup time (mins)</Label>
            <Input type="number" min="1" {...register("estimated_pickup_minutes", { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label>Tax rate (%)</Label>
            <Input type="number" step="0.01" min="0" max="100" {...register("tax_rate", { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Input {...register("timezone")} placeholder="America/New_York" />
          </div>
        </div>
      </section>

      <Separator />

      {/* Operating Hours */}
      <section className="space-y-4">
        <h2 className="font-semibold text-lg">Operating hours</h2>
        <div className="space-y-2">
          {DAYS_OF_WEEK.map((day) => {
            const h = hours[day] ?? { open: "09:00", close: "22:00", closed: false }
            return (
              <div key={day} className="flex items-center gap-3">
                <div className="w-24 text-sm capitalize font-medium">{day}</div>
                <Switch checked={!h.closed} onCheckedChange={(v) => updateHours(day, "closed", !v)} />
                {!h.closed ? (
                  <>
                    <Input type="time" value={h.open} onChange={(e) => updateHours(day, "open", e.target.value)} className="w-32 h-8 text-sm" />
                    <span className="text-muted-foreground text-sm">to</span>
                    <Input type="time" value={h.close} onChange={(e) => updateHours(day, "close", e.target.value)} className="w-32 h-8 text-sm" />
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">Closed</span>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <Separator />

      {/* Stripe Keys */}
      <section className="space-y-4">
        <div>
          <h2 className="font-semibold text-lg">Stripe configuration</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your Stripe keys to accept online card payments. Leave blank to keep existing values.
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Publishable key</Label>
            <Input {...register("stripe_publishable_key")} placeholder="pk_live_…" />
            <p className="text-xs text-muted-foreground">Safe to expose — used in the browser to initialise Stripe.</p>
          </div>
          <div className="space-y-2">
            <Label>Secret key {restaurant.stripe_secret_key_encrypted && <span className="text-xs font-normal text-muted-foreground ml-1">(already set — enter new value to update)</span>}</Label>
            <Input
              type="password"
              value={stripeSecret}
              onChange={(e) => setStripeSecret(e.target.value)}
              placeholder={restaurant.stripe_secret_key_encrypted ? "••••••••••••••••" : "sk_live_…"}
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label>Webhook secret {restaurant.stripe_webhook_secret_encrypted && <span className="text-xs font-normal text-muted-foreground ml-1">(already set — enter new value to update)</span>}</Label>
            <Input
              type="password"
              value={stripeWebhookSecret}
              onChange={(e) => setStripeWebhookSecret(e.target.value)}
              placeholder={restaurant.stripe_webhook_secret_encrypted ? "••••••••••••••••" : "whsec_…"}
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              Register your webhook URL in the Stripe dashboard:{" "}
              <code className="bg-muted px-1 rounded text-xs">
                {typeof window !== "undefined" ? window.location.origin : ""}/api/stripe/webhook/{restaurant.slug}
              </code>
            </p>
          </div>
        </div>
      </section>

      <div className="flex justify-end pb-8">
        <Button type="submit" disabled={saving || isUploading}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  )
}
