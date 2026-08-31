import { GridSkeleton } from "@/components/DataState";

export default function LabsLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-6 w-24 animate-pulse rounded-card bg-[#E8E9F1]" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded-card bg-[#E8E9F1]" />
        </div>
        <div className="h-10 w-28 animate-pulse rounded-card bg-[#E8E9F1]" />
      </div>
      <GridSkeleton count={6} />
    </div>
  );
}
