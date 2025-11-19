import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 md:py-8 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-44 rounded-2xl" />
        <div className="space-y-4 lg:col-span-1">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Skeleton key={idx} className="h-24 rounded-xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-2xl" />
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-48 rounded-2xl" />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
