/**
 * Page transition shown inside the <main> content area during client-side
 * route navigation. Rendered by Next.js App Router via a route-level
 * `loading.tsx` — only the content area is replaced, the sidebar/topnav stay
 * mounted and static.
 *
 * Shows a slim animated progress bar at the top of the content area plus a
 * lightweight skeleton of the page body. Everything fades in on mount.
 */
export default function PageTransition() {
  return (
    <div
      className="page-enter min-h-[50vh] w-full"
      aria-busy="true"
      aria-label="Loading page"
    >
      {/* Top progress bar — fixed to the top of the viewport, but only the
          content area below it is swapped; sidebar/topnav stay mounted. */}
      <div className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden">
        <div className="h-full w-1/3 animate-[slideX_1.1s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-[#683290] to-transparent" />
      </div>

      <div className="space-y-6">
        {/* Page header skeleton */}
        <div className="space-y-3">
          <div className="h-4 w-24 animate-pulse rounded-card bg-[#E8E9F1]" />
          <div className="h-8 w-64 max-w-full animate-pulse rounded-card bg-[#E8E9F1]" />
          <div className="h-4 w-96 max-w-full animate-pulse rounded-card bg-[#E8E9F1]" />
        </div>

        {/* Card skeleton */}
        <div className="rounded-card border border-border bg-background p-5 shadow-card">
          <div className="h-4 w-40 animate-pulse rounded-card bg-[#E8E9F1]" />
          <div className="mt-4 space-y-3">
            <div className="h-4 w-full animate-pulse rounded-card bg-[#E8E9F1]" />
            <div className="h-4 w-5/6 animate-pulse rounded-card bg-[#E8E9F1]" />
            <div className="h-4 w-4/6 animate-pulse rounded-card bg-[#E8E9F1]" />
          </div>
        </div>

        {/* Row skeletons */}
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4 rounded-card border border-border bg-background p-4 shadow-card">
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-[#E8E9F1]" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-2/3 animate-pulse rounded-card bg-[#E8E9F1]" />
                <div className="h-3 w-1/3 animate-pulse rounded-card bg-[#E8E9F1]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
