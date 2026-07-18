export default function WalletSkeleton() {
  return (
    <div className="p-4 space-y-4 animate-pulse">

      {/* Balance card */}
      <div className="rounded-2xl border p-6 space-y-4">
        <div className="h-5 w-40 bg-muted rounded" />
        <div className="h-10 w-60 bg-muted rounded" />

        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-muted rounded-xl" />
          <div className="h-20 bg-muted rounded-xl" />
        </div>
      </div>

      {/* Transactions */}
      <div className="rounded-2xl border p-6 space-y-4">
        <div className="h-5 w-32 bg-muted rounded" />

        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-4 w-40 bg-muted rounded" />
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
            <div className="h-5 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>

    </div>
  );
}