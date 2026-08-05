export default function AppLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-64 rounded-md bg-surface" />
      <div className="mt-2 h-4 w-96 max-w-full rounded-md bg-surface" />

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-card border border-border bg-surface" />
        ))}
      </div>

      <div className="mt-8 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-card border border-border bg-surface" />
        ))}
      </div>
    </div>
  );
}
