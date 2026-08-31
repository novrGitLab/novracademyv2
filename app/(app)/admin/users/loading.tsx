import { TableSkeleton } from "@/components/Skeleton";

export default function AdminUsersLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded-card bg-[#E8E9F1]" />
      <TableSkeleton rows={6} />
    </div>
  );
}
