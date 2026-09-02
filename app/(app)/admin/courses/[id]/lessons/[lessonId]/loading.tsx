export default function LessonEditorLoading() {
  return (
    <div className="max-w-2xl">
      <div className="h-4 w-32 animate-pulse rounded bg-surface" />
      <div className="mt-3 h-7 w-64 animate-pulse rounded bg-surface" />
      <div className="mt-8 rounded-card border border-border bg-background p-6">
        <div className="h-5 w-40 animate-pulse rounded bg-surface" />
        <div className="mt-6 h-32 animate-pulse rounded-card bg-surface" />
        <p className="mt-4 text-[13px] text-text-secondary">Loading lesson editor…</p>
      </div>
    </div>
  );
}
