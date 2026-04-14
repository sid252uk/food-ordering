"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { signUpSchema } from "@/lib/validations"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

type FormData = z.infer<typeof signUpSchema>

export default function SignUpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get("returnTo") || "/"
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(signUpSchema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { first_name: data.first_name, last_name: data.last_name },
        },
      })
      if (error) throw error
      toast.success("Account created! Check your email to confirm.")
      router.push(returnTo)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign up failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Sign up to start ordering from your favourite restaurants</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First name</Label>
              <Input id="first_name" {...register("first_name")} />
              {errors.first_name && <p className="text-sm text-destructive">{errors.first_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last name</Label>
              <Input id="last_name" {...register("last_name")} />
              {errors.last_name && <p className="text-sm text-destructive">{errors.last_name.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
            {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href={`/sign-in?returnTo=${encodeURIComponent(returnTo)}`} className="underline text-foreground">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
