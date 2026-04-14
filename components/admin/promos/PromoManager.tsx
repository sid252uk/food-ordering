"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { PromoCode } from "@/types"

export function PromoManager({ restaurant }: { restaurant: { id: string; slug: string } }) {
  const [showForm, setShowForm] = useState(false)
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null)
  const queryClient = useQueryClient()

  const { data: promos } = useQuery({
    queryKey: ["admin-promos", restaurant.id],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from("promo_codes").select("*").eq("restaurant_id", restaurant.id).order("created_at", { ascending: false })
      if (error) throw error
      return data as PromoCode[]
    },
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-promos", restaurant.id] })

  const toggleActive = async (promo: PromoCode) => {
    const supabase = createClient()
    await supabase.from("promo_codes").update({ is_active: !promo.is_active }).eq("id", promo.id)
    invalidate()
  }

  const deletePromo = async (id: string) => {
    const supabase = createClient()
    await supabase.from("promo_codes").delete().eq("id", id)
    toast.success("Promo deleted")
    invalidate()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Promo Codes</h1>
        <Button size="sm" onClick={() => { setEditingPromo(null); setShowForm(true) }}>
          <Plus className="h-4 w-4 mr-1" /> New promo code
        </Button>
      </div>

      {(promos ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">No promo codes yet.</p>
      ) : (
        <div className="space-y-3">
          {(promos ?? []).map((promo) => (
            <div key={promo.id} className="bg-white border rounded-xl px-5 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <code className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-sm">{promo.code}</code>
                  {!promo.is_active && <Badge variant="secondary">Inactive</Badge>}
                  {promo.expires_at && new Date(promo.expires_at) < new Date() && <Badge variant="destructive">Expired</Badge>}
                </div>
                <p className="text-sm text-gray-700">
                  {promo.promo_type === "percentage" ? `${promo.discount_value}% off` : `${formatCurrency(promo.discount_value)} off`}
                  {promo.min_order_amount && ` · min. ${formatCurrency(promo.min_order_amount)}`}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {promo.current_uses} uses {promo.max_uses ? `/ ${promo.max_uses}` : ""}
                  {promo.expires_at && ` · expires ${formatDate(promo.expires_at)}`}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch checked={promo.is_active} onCheckedChange={() => toggleActive(promo)} />
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingPromo(promo); setShowForm(true) }}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deletePromo(promo.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <PromoForm
          restaurantId={restaurant.id}
          promo={editingPromo}
          onClose={() => { setShowForm(false); setEditingPromo(null) }}
          onSaved={invalidate}
        />
      )}
    </div>
  )
}

function PromoForm({ restaurantId, promo, onClose, onSaved }: { restaurantId: string; promo: PromoCode | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    code: promo?.code ?? "",
    promo_type: promo?.promo_type ?? "percentage",
    discount_value: promo?.discount_value ?? 10,
    min_order_amount: promo?.min_order_amount ?? "",
    max_uses: promo?.max_uses ?? "",
    expires_at: promo?.expires_at ? promo.expires_at.split("T")[0] : "",
    is_active: promo?.is_active ?? true,
  })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    const supabase = createClient()
    const data = {
      restaurant_id: restaurantId,
      code: form.code.toUpperCase(),
      promo_type: form.promo_type as "percentage" | "fixed_amount",
      discount_value: Number(form.discount_value),
      min_order_amount: form.min_order_amount ? Number(form.min_order_amount) : null,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      is_active: form.is_active,
    }
    if (promo) {
      const { error } = await supabase.from("promo_codes").update(data).eq("id", promo.id)
      if (error) { toast.error(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from("promo_codes").insert(data)
      if (error) { toast.error(error.message); setSaving(false); return }
    }
    toast.success(promo ? "Promo updated" : "Promo created")
    onSaved()
    onClose()
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{promo ? "Edit promo code" : "New promo code"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Code</Label>
            <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SAVE10" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.promo_type} onValueChange={(v) => setForm((f) => ({ ...f, promo_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed_amount">Fixed amount ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Value</Label>
              <Input type="number" value={form.discount_value} onChange={(e) => setForm((f) => ({ ...f, discount_value: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Min. order ($) <span className="text-muted-foreground">(optional)</span></Label>
              <Input type="number" value={form.min_order_amount} onChange={(e) => setForm((f) => ({ ...f, min_order_amount: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Max uses <span className="text-muted-foreground">(optional)</span></Label>
              <Input type="number" value={form.max_uses} onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Expiry date <span className="text-muted-foreground">(optional)</span></Label>
            <Input type="date" value={form.expires_at} onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))} />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={form.is_active} onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))} />
            <Label>Active</Label>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
