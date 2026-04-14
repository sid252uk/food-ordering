"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function AdminError({
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
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <h2 className="text-xl font-bold">Admin error</h2>
      <p className="text-muted-foreground">An error occurred loading the admin panel.</p>
      {error.digest && <p className="text-xs text-muted-foreground font-mono">ID: {error.digest}</p>}
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
