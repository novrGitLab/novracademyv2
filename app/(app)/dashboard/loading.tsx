import { Skeleton } from "@/components/DataState";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-8 pb-8">
      {/* Hero skeleton */}
      <div className="rounded-card bg-gradient-brand p-6 sm:p-8">
        <Skeleton className="h-3 w-24 bg-white/20" />
        <Skeleton className="mt-4 h-8 w-64 bg-white/20" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full bg-white/15" />
        <div className="mt-6 flex items-center gap-4">
          <Skeleton className="h-10 w-40 rounded-card bg-white/20" />
          <Skeleton className="h-20 w-20 rounded-full bg-white/15" />
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-card border border-border bg-background p-4 shadow-card">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-8 w-16" />
          </div>
        ))}
      </div>

      {/* My Courses */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-card border border-border bg-background p-5 shadow-card">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-3 h-5 w-3/4" />
              <Skeleton className="mt-4 h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
