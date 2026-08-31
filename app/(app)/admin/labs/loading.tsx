import { CardsSkeleton } from "@/components/Skeleton";

export default function AdminLabsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 animate-pulse rounded-card bg-[#E8E9F1]" />
        <div className="h-10 w-28 animate-pulse rounded-card bg-[#E8E9F1]" />
      </div>
      <CardsSkeleton count={6} />
    </div>
  );
}
