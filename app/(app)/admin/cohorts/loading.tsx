import { CardsSkeleton } from "@/components/Skeleton";

export default function AdminCohortsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 animate-pulse rounded-card bg-[#E8E9F1]" />
      <CardsSkeleton count={4} />
    </div>
  );
}
