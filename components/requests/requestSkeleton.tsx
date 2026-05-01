export const RequestSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="animate-pulse rounded-xl border border-border bg-card p-5 space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex gap-2 items-center">
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="h-5 w-16 rounded-full bg-muted" />
          </div>
          <div className="h-4 w-20 rounded bg-muted" />
        </div>
        <div className="h-3 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
        <div className="flex gap-2 pt-1">
          <div className="h-8 w-24 rounded-lg bg-muted" />
        </div>
      </div>
    ))}
  </div>
);