"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { signInSchema } from "@/lib/validations"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

type FormData = z.infer<typeof signInSchema>

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get("returnTo") || "/"
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
      if (error) throw error
      toast.success("Welcome back!")
      router.push(returnTo)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Enter your email and password to continue</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
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
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href={`/sign-up?returnTo=${encodeURIComponent(returnTo)}`} className="underline text-foreground">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
