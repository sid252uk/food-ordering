"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { slugify } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, ChevronRight } from "lucide-react"

const step1Schema = z.object({
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
})

const step2Schema = z.object({
  name: z.string().min(2, "Restaurant name required"),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>

export default function OnboardPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const form1 = useForm<Step1Data>({ resolver: zodResolver(step1Schema) })
  const form2 = useForm<Step2Data>({ resolver: zodResolver(step2Schema) })

  // Auto-generate slug from restaurant name
  const watchName = form2.watch("name")
  const handleNameBlur = () => {
    if (!form2.getValues("slug") && watchName) {
      form2.setValue("slug", slugify(watchName))
    }
  }

  const onStep1Submit = async (data: Step1Data) => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { first_name: data.first_name, last_name: data.last_name } },
      })
      if (error) throw error
      if (!authData.user) throw new Error("No user returned")
      setUserId(authData.user.id)
      setStep(2)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  const onStep2Submit = async (data: Step2Data) => {
    if (!userId) return
    setLoading(true)
    try {
      const supabase = createClient()

      // Update profile role to restaurant_owner
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ role: "restaurant_owner" })
        .eq("id", userId)

      if (profileError) throw profileError

      // Create restaurant
      const { data: restaurant, error: restError } = await supabase
        .from("restaurants")
        .insert({
          owner_user_id: userId,
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          phone: data.phone || null,
          email: data.email || null,
        })
        .select()
        .single()

      if (restError) {
        if (restError.code === "23505") throw new Error("That URL is already taken. Choose a different one.")
        throw restError
      }

      toast.success("Your restaurant is ready!")
      router.push(`/${restaurant.slug}/admin`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create restaurant")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <ShoppingBag className="h-7 w-7 text-blue-600" />
        <span className="font-bold text-xl">FoodOrder</span>
      </Link>

      <div className="w-full max-w-md">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className={`flex items-center gap-2 text-sm font-medium ${step >= 1 ? "text-blue-600" : "text-gray-400"}`}>
            <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>1</span>
            Your account
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <div className={`flex items-center gap-2 text-sm font-medium ${step >= 2 ? "text-blue-600" : "text-gray-400"}`}>
            <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>2</span>
            Your restaurant
          </div>
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Create your account</CardTitle>
              <CardDescription>You&apos;ll use this to manage your restaurant</CardDescription>
            </CardHeader>
            <form onSubmit={form1.handleSubmit(onStep1Submit)}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First name</Label>
                    <Input {...form1.register("first_name")} />
                    {form1.formState.errors.first_name && <p className="text-xs text-destructive">{form1.formState.errors.first_name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Last name</Label>
                    <Input {...form1.register("last_name")} />
                    {form1.formState.errors.last_name && <p className="text-xs text-destructive">{form1.formState.errors.last_name.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="you@example.com" {...form1.register("email")} />
                  {form1.formState.errors.email && <p className="text-xs text-destructive">{form1.formState.errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" {...form1.register("password")} />
                  {form1.formState.errors.password && <p className="text-xs text-destructive">{form1.formState.errors.password.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account…" : "Continue"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/sign-in" className="underline">Sign in</Link>
                </p>
              </CardContent>
            </form>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Set up your restaurant</CardTitle>
              <CardDescription>You can change these details any time in settings</CardDescription>
            </CardHeader>
            <form onSubmit={form2.handleSubmit(onStep2Submit)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Restaurant name</Label>
                  <Input placeholder="Bella Italia" {...form2.register("name")} onBlur={handleNameBlur} />
                  {form2.formState.errors.name && <p className="text-xs text-destructive">{form2.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Your URL</Label>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground shrink-0">{process.env.NEXT_PUBLIC_APP_URL || "yoursite.com"}/</span>
                    <Input placeholder="bella-italia" {...form2.register("slug")} className="flex-1" />
                  </div>
                  {form2.formState.errors.slug && <p className="text-xs text-destructive">{form2.formState.errors.slug.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Description <span className="text-muted-foreground">(optional)</span></Label>
                  <Textarea placeholder="Authentic Italian cuisine…" {...form2.register("description")} rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone <span className="text-muted-foreground">(optional)</span></Label>
                    <Input type="tel" {...form2.register("phone")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact email <span className="text-muted-foreground">(optional)</span></Label>
                    <Input type="email" {...form2.register("email")} />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating restaurant…" : "Create restaurant"}
                </Button>
              </CardContent>
            </form>
          </Card>
        )}
      </div>
    </div>
  )
}
