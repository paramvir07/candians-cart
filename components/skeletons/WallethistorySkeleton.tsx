export function WalletHistorySkeleton() {
  return (
    <div className="animate-pulse">
      {/* Stats header skeleton */}
      <div className="bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="h-3 w-32 rounded bg-primary/15" />
            <div className="h-8 w-40 rounded bg-primary/20" />
            <div className="h-3 w-28 rounded bg-primary/10" />
          </div>
          <div className="w-24 h-14 rounded-xl bg-primary/10 shrink-0" />
        </div>
        <div className="mt-4 flex items-center gap-4">
          <div className="h-3 w-36 rounded bg-primary/10" />
          <div className="h-3 w-28 rounded bg-primary/10 hidden sm:block" />
        </div>
      </div>

      {/* Body skeleton */}
      <div className="mt-4 lg:grid lg:grid-cols-[1fr_340px] lg:gap-6 xl:grid-cols-[1fr_380px]">
        {/* List */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-4 sm:p-5">
          <div className="h-10 rounded-xl bg-muted/60" />
          <div className="flex gap-2 mt-3 border-b border-border/50 pb-2 lg:hidden">
            <div className="h-6 w-16 rounded bg-muted/60" />
            <div className="h-6 w-16 rounded bg-muted/60" />
          </div>
          <div className="mt-3 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted/60 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-32 rounded bg-muted/60" />
                  <div className="h-2.5 w-20 rounded bg-muted/40" />
                </div>
                <div className="h-3 w-14 rounded bg-muted/60" />
              </div>
            ))}
          </div>
        </div>

        {/* Analytics sidebar */}
        <aside className="hidden lg:block">
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-5 space-y-4">
            <div className="h-4 w-20 rounded bg-muted/60" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-12 rounded-xl bg-muted/40" />
              <div className="h-12 rounded-xl bg-muted/40" />
            </div>
            <div className="h-20 rounded-xl bg-muted/40" />
            <div className="h-16 rounded-xl bg-muted/40" />
          </div>
        </aside>
      </div>
    </div>
  );
}