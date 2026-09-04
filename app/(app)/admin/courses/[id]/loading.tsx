export default function CourseDetailLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 py-6">
      <div className="h-4 w-32 animate-pulse rounded bg-surface" />
      <div className="rounded-card border border-border bg-background p-6">
        <div className="h-6 w-48 animate-pulse rounded bg-surface" />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="h-36 animate-pulse rounded-card bg-surface" />
          <div className="space-y-3">
            <div className="h-5 w-3/4 animate-pulse rounded bg-surface" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-surface" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-surface" />
          </div>
        </div>
      </div>
      <div className="rounded-card border border-border bg-background p-6">
        <div className="h-5 w-32 animate-pulse rounded bg-surface" />
        <div className="mt-4 space-y-2">
          <div className="h-14 animate-pulse rounded-card bg-surface" />
          <div className="h-14 animate-pulse rounded-card bg-surface" />
        </div>
        <p className="mt-4 text-[13px] text-text-secondary">Loading course…</p>
      </div>
    </div>
  );
}
