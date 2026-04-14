import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
      <p className="text-8xl font-bold text-muted-foreground/30">404</p>
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-muted-foreground max-w-sm">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Button asChild>
        <Link href="/">Go home</Link>
      </Button>
    </div>
  )
}
