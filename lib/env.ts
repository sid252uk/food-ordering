import { z } from "zod"

// NOTE: Stripe and Resend vars are optional here for development flexibility.
// They MUST be set in production for payment processing and email delivery to work.

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  // Stripe — optional (configured per-restaurant; platform default optional)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  // Resend — optional (emails silently skipped when not configured)
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
  // Encryption key for storing per-restaurant Stripe keys — must be 32 chars
  ENCRYPTION_KEY: z.string().min(1),
})

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().min(1),
})

function parseServerEnv() {
  const result = serverEnvSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  })

  if (!result.success) {
    console.error("Invalid server environment variables:")
    console.error(result.error.flatten().fieldErrors)
    throw new Error("Invalid server environment variables. Check your .env file.")
  }

  return result.data
}

function parseClientEnv() {
  const result = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  })

  if (!result.success) {
    console.error("Invalid client environment variables:")
    console.error(result.error.flatten().fieldErrors)
    throw new Error("Invalid client environment variables. Check your .env file.")
  }

  return result.data
}

// Lazy-parsed so that missing vars don't crash at import time in edge runtimes
// that don't use server-side vars. Call these functions where needed.
export function getServerEnv() {
  return parseServerEnv()
}

export function getClientEnv() {
  return parseClientEnv()
}

// Pre-parsed exports for convenience (server-side only — do not import on client)
export const serverEnv = parseServerEnv()
export const clientEnv = parseClientEnv()
