import { CardsSkeleton } from "@/components/Skeleton";

export default function AdminMarketingLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded-card bg-[#E8E9F1]" />
        <div className="h-10 w-32 animate-pulse rounded-card bg-[#E8E9F1]" />
      </div>
      <CardsSkeleton count={4} />
    </div>
  );
}
