import { StatCardsSkeleton, TableSkeleton } from "@/components/Skeleton";

export default function AdminAnalyticsLoading() {
  return (
    <div className="space-y-6">
      <StatCardsSkeleton count={4} />
      <TableSkeleton rows={5} />
    </div>
  );
}
