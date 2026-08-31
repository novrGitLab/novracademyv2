import { TableSkeleton } from "@/components/Skeleton";

export default function AdminOrganizationsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-56 animate-pulse rounded-card bg-[#E8E9F1]" />
      <TableSkeleton rows={5} />
    </div>
  );
}
