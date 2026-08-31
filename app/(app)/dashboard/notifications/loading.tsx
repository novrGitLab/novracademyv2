import { Skeleton } from "@/components/DataState";

export default function NotificationsLoading() {
  return (
    <div className="w-full max-w-2xl space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-card border border-border bg-background p-5 shadow-card">
            <Skeleton className="h-4 w-52" />
            <Skeleton className="mt-2 h-3 w-80 max-w-full" />
            <Skeleton className="mt-3 h-3 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}
