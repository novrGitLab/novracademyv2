"use client";

import type { ReactNode } from "react";
import { AlertTriangle, Inbox, RefreshCw } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Skeleton primitives                                                        */
/* -------------------------------------------------------------------------- */

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-card bg-[#E8E9F1] ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-card border border-border bg-background p-5 shadow-card">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-5 w-3/4" />
      <Skeleton className="mt-2 h-4 w-1/2" />
      <div className="mt-4 flex items-center justify-between">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-24 rounded-card" />
      </div>
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-card border border-border bg-background px-5 py-4 shadow-card">
      <div className="min-w-0 flex-1">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-2 h-3 w-64" />
      </div>
      <Skeleton className="h-8 w-16 rounded-card" />
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  DataState — unified loading / error / empty / loaded wrapper               */
/* -------------------------------------------------------------------------- */

interface DataStateProps {
  loading?: boolean;
  error?: boolean;
  errorMessage?: string;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: ReactNode;
  skeleton?: "grid" | "rows" | "custom" | "none";
  onRetry?: () => void;
  children: ReactNode;
}

export function DataState({
  loading = false,
  error = false,
  errorMessage = "Something went wrong while loading this.",
  empty = false,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  emptyIcon,
  skeleton = "grid",
  onRetry,
  children,
}: DataStateProps) {
  if (loading) {
    if (skeleton === "grid") return <GridSkeleton />;
    if (skeleton === "rows") return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <RowSkeleton key={i} />
        ))}
      </div>
    );
    if (skeleton === "custom") return (
      <div className="flex min-h-[30vh] items-center justify-center rounded-card border border-dashed border-border bg-surface text-sm text-text-secondary">
        Loading...
      </div>
    );
    return null;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-red-200 bg-red-50 px-6 py-12 text-center">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <p className="text-[14px] font-medium text-red-700">{errorMessage}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 rounded-card border border-red-300 bg-white px-4 py-2 text-[13px] font-medium text-red-700 transition hover:bg-red-100"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Try again
          </button>
        )}
      </div>
    );
  }

  if (empty) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-border bg-background px-6 py-12 text-center">
        {emptyIcon ?? <Inbox className="h-8 w-8 text-text-secondary" />}
        <p className="text-[14px] font-medium text-text-primary">{emptyTitle}</p>
        {emptyDescription && (
          <p className="max-w-sm text-[13px] text-text-secondary">{emptyDescription}</p>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
