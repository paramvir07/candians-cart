export function DrawPromoCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary/10 p-5 animate-pulse">
      <div className="space-y-3">
        {/* Label pill */}
        <div className="h-5 w-24 rounded-full bg-primary/15" />

        {/* Prize block */}
        <div className="space-y-2">
          <div className="h-3 w-32 rounded bg-primary/15" />
          <div className="h-8 w-28 rounded bg-primary/20" />
          <div className="h-3 w-36 rounded bg-primary/15" />
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3">
          <div className="h-4 w-20 rounded bg-primary/15" />
          <div className="h-4 w-16 rounded bg-primary/15" />
        </div>

        {/* CTA */}
        <div className="h-4 w-28 rounded bg-primary/15" />
      </div>
    </div>
  );
}