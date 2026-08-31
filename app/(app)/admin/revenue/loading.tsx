import { StatCardsSkeleton } from "@/components/Skeleton";

export default function AdminRevenueLoading() {
  return (
    <div className="space-y-6">
      <StatCardsSkeleton count={4} />
      <div className="h-6 w-40 animate-pulse rounded-card bg-[#E8E9F1]" />
    </div>
  );
}
