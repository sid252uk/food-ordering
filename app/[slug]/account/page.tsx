"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { profileSchema } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import type { z } from "zod"

type FormData = z.infer<typeof profileSchema>

export default function AccountProfilePage() {
  const [loading, setLoading] = useState(true)

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { first_name: "", last_name: "", phone: "", marketing_opt_in: false },
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      if (data) {
        reset({
          first_name: data.first_name ?? "",
          last_name: data.last_name ?? "",
          phone: data.phone ?? "",
          marketing_opt_in: data.marketing_opt_in,
        })
      }
      setLoading(false)
    })
  }, [reset])

  const onSubmit = async (data: FormData) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from("profiles").update(data).eq("id", user.id)
    if (error) {
      toast.error("Failed to save profile")
    } else {
      toast.success("Profile updated")
    }
  }

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map((n) => <div key={n} className="h-10 bg-muted rounded" />)}</div>

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <h2 className="font-semibold text-lg">Profile</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>First name</Label>
          <Input {...register("first_name")} />
          {errors.first_name && <p className="text-sm text-destructive">{errors.first_name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Last name</Label>
          <Input {...register("last_name")} />
          {errors.last_name && <p className="text-sm text-destructive">{errors.last_name.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Phone <span className="text-muted-foreground">(optional)</span></Label>
        <Input {...register("phone")} type="tel" />
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <Switch
          checked={watch("marketing_opt_in")}
          onCheckedChange={(v) => setValue("marketing_opt_in", v)}
        />
        <span className="text-sm">Receive promotional emails</span>
      </label>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save changes"}
      </Button>
    </form>
  )
}
