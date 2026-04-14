"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function SlugError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <h2 className="text-xl font-bold">Something went wrong</h2>
      <p className="text-muted-foreground">We couldn&apos;t load this page. Please try again.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
