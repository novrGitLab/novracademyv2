import { StatCardsSkeleton, TableSkeleton } from "@/components/Skeleton";

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="rounded-card border border-border bg-background p-6 shadow-card">
        <div className="h-8 w-64 animate-pulse rounded-card bg-[#E8E9F1]" />
        <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded-card bg-[#E8E9F1]" />
      </div>
      <StatCardsSkeleton count={4} />
      <TableSkeleton rows={5} />
    </div>
  );
}
