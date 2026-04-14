import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header skeleton */}
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col gap-2 w-40 shrink-0">
          {[1,2,3,4].map((n) => <Skeleton key={n} className="h-8 rounded-lg" />)}
        </div>
        {/* Grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden border">
              <Skeleton className="h-40 w-full" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
