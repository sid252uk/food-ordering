import { Skeleton } from "@/components/ui/skeleton"

export default function AdminLoading() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map((n) => <Skeleton key={n} className="h-24 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  )
}
