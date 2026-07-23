export function PromoCarouselSkeleton() {
  return (
    <div className="w-full">
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 h-[220px] animate-pulse" />
      <div className="flex items-center justify-center gap-1.5 mt-3">
        <span className="block h-1.5 w-5 rounded-full bg-amber-200" />
        <span className="block h-1.5 w-1.5 rounded-full bg-amber-100" />
      </div>
    </div>
  );
}
