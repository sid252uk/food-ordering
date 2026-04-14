"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
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
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-muted-foreground max-w-sm">
        An unexpected error occurred. Please try again.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground font-mono">Error ID: {error.digest}</p>
      )}
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
