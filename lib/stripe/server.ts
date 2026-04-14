import Stripe from "stripe"

export function getStripeServer(secretKey: string) {
  return new Stripe(secretKey, {
    apiVersion: "2026-03-25.dahlia",
  })
}

export function encryptKey(key: string): string {
  // Simple base64 encoding for now - replace with proper encryption in production
  return Buffer.from(key).toString("base64")
}

export function decryptKey(encrypted: string): string {
  return Buffer.from(encrypted, "base64").toString("utf-8")
}
