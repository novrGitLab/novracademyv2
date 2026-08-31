import { TableSkeleton } from "@/components/Skeleton";

export default function AdminComplianceLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded-card bg-[#E8E9F1]" />
      <TableSkeleton rows={5} />
    </div>
  );
}
