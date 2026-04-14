"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { addressSchema } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, MapPin } from "lucide-react"
import type { z } from "zod"
import type { Database } from "@/types/database.types"

type Address = Database["public"]["Tables"]["addresses"]["Row"]
type FormData = z.infer<typeof addressSchema>

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const load = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from("addresses").select("*").eq("user_id", user.id).order("created_at")
    setAddresses(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from("addresses").delete().eq("id", id)
    toast.success("Address removed")
    load()
  }

  const openEdit = (id: string) => { setEditingId(id); setShowForm(true) }
  const openNew = () => { setEditingId(null); setShowForm(true) }
  const closeForm = () => { setShowForm(false); setEditingId(null) }

  if (loading) return <div className="animate-pulse space-y-3">{[1,2].map((n) => <div key={n} className="h-16 bg-muted rounded-lg" />)}</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Saved addresses</h2>
        <Button size="sm" onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> Add address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">No saved addresses yet.</p>
      ) : (
        <div className="space-y-2">
          {addresses.map((addr) => (
            <div key={addr.id} className="flex items-start gap-3 bg-white border rounded-lg px-4 py-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                {addr.label && <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">{addr.label}</p>}
                <p className="text-sm">{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ""}</p>
                <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.postal_code}</p>
                {addr.delivery_notes && <p className="text-xs text-muted-foreground mt-0.5 italic">{addr.delivery_notes}</p>}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(addr.id)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(addr.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <AddressForm
          addressId={editingId}
          onClose={closeForm}
          onSaved={() => { load(); closeForm() }}
        />
      )}
    </div>
  )
}

function AddressForm({ addressId, onClose, onSaved }: { addressId: string | null; onClose: () => void; onSaved: () => void }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: { label: "", address_line1: "", address_line2: "", city: "", state: "", postal_code: "", country: "US", delivery_notes: "" },
  })

  useEffect(() => {
    if (!addressId) return
    const supabase = createClient()
    supabase.from("addresses").select("*").eq("id", addressId).single().then(({ data }) => {
      if (data) reset({
        label: data.label ?? "",
        address_line1: data.address_line1,
        address_line2: data.address_line2 ?? "",
        city: data.city,
        state: data.state,
        postal_code: data.postal_code,
        country: data.country,
        delivery_notes: data.delivery_notes ?? "",
      })
    })
  }, [addressId, reset])

  const onSubmit = async (data: FormData) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    if (addressId) {
      const { error } = await supabase.from("addresses").update(data).eq("id", addressId)
      if (error) { toast.error("Failed to update address"); return }
      toast.success("Address updated")
    } else {
      const { error } = await supabase.from("addresses").insert({ ...data, user_id: user.id })
      if (error) { toast.error("Failed to save address"); return }
      toast.success("Address saved")
    }
    onSaved()
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{addressId ? "Edit address" : "Add address"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Label <span className="text-muted-foreground">(optional, e.g. Home)</span></Label>
            <Input {...register("label")} placeholder="Home" />
          </div>
          <div className="space-y-2">
            <Label>Street address</Label>
            <Input {...register("address_line1")} />
            {errors.address_line1 && <p className="text-sm text-destructive">{errors.address_line1.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Apt / Suite <span className="text-muted-foreground">(optional)</span></Label>
            <Input {...register("address_line2")} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2 col-span-2">
              <Label>City</Label>
              <Input {...register("city")} />
              {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input {...register("state")} />
              {errors.state && <p className="text-sm text-destructive">{errors.state.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Postal code</Label>
              <Input {...register("postal_code")} />
              {errors.postal_code && <p className="text-sm text-destructive">{errors.postal_code.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input {...register("country")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Delivery notes <span className="text-muted-foreground">(optional)</span></Label>
            <Input {...register("delivery_notes")} placeholder="Leave at door, buzz #4…" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Save address"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
