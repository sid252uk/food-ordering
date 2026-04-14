import { cn } from "@/lib/utils"

interface Props {
  className?: string
  size?: "sm" | "md" | "lg"
}

const SIZE_MAP = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-4",
}

export function LoadingSpinner({ className, size = "md" }: Props) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-muted border-t-primary",
        SIZE_MAP[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  )
}

export function FullPageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" />
    </div>
  )
}
