export function ReferralPageSkeleton() {
  return (
    <div className="min-h-screen w-full bg-background">
      <div
        className="relative mx-auto w-full px-4 pb-16 pt-8 sm:px-6 sm:pt-12"
        style={{ maxWidth: "520px" }}
      >
        {/* ── Page header ── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="h-9 w-44 rounded-xl bg-muted animate-pulse" />
            <div className="h-8 w-8 rounded-xl bg-muted animate-pulse" />
          </div>
          <div className="h-4 w-72 rounded-full bg-muted/70 animate-pulse mt-2" />
        </div>

        {/* ── EarningsHero skeleton ── */}
        <div className="mb-3 rounded-2xl overflow-hidden border border-border/60 shadow-sm">
          {/* Green top */}
          <div
            className="px-5 pt-5 pb-5"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.6271 0.1699 149.2138 / 0.35) 0%, oklch(0.4104 0.1066 149.9393 / 0.35) 100%)",
            }}
          >
            <div className="h-3 w-20 rounded-full bg-white/20 animate-pulse mb-3" />
            <div className="h-12 w-32 rounded-xl bg-white/20 animate-pulse mb-5" />
            <div className="grid grid-cols-3 gap-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-white/10 border border-white/10 px-3 py-2.5 space-y-1.5"
                >
                  <div className="h-2.5 w-12 rounded-full bg-white/20 animate-pulse" />
                  <div className="h-4 w-10 rounded-full bg-white/20 animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* White bottom */}
          <div className="bg-card px-5 pt-4 pb-5">
            <div className="h-2.5 w-24 rounded-full bg-muted animate-pulse mb-2" />
            <div className="h-12 w-full rounded-xl bg-muted/60 animate-pulse" />
            <div className="mt-3 pt-3 border-t border-border/60 flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-10 rounded-xl bg-muted/60 animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── HowItWorks skeleton ── */}
        <div className="mb-3 rounded-2xl bg-card border border-border/60 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-lg bg-muted animate-pulse" />
              <div className="h-4 w-24 rounded-full bg-muted animate-pulse" />
            </div>
            <div className="h-4 w-4 rounded-full bg-muted animate-pulse" />
          </div>
        </div>

        {/* ── UsageStats skeleton ── */}
        <div className="mb-3 rounded-2xl bg-card border border-border/60 px-5 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="h-2.5 w-20 rounded-full bg-muted animate-pulse" />
            <div className="h-2.5 w-28 rounded-full bg-muted animate-pulse" />
          </div>
          <div className="flex gap-1 mb-3">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="flex-1 h-1.5 rounded-full bg-muted animate-pulse"
              />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="h-3 w-20 rounded-full bg-muted animate-pulse" />
            <div className="h-3 w-16 rounded-full bg-muted animate-pulse" />
          </div>
        </div>

        {/* ── UsedByList skeleton ── */}
        <div className="rounded-2xl bg-card border border-border/60 px-5 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="h-2.5 w-40 rounded-full bg-muted animate-pulse" />
          </div>
          <div className="flex flex-col">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-3"
                style={{
                  borderTop:
                    i > 0
                      ? "1px solid hsl(var(--border) / 0.5)"
                      : undefined,
                }}
              >
                <div className="h-10 w-10 shrink-0 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-28 rounded-full bg-muted animate-pulse" />
                  <div className="h-2.5 w-20 rounded-full bg-muted/60 animate-pulse" />
                </div>
                <div className="h-6 w-14 rounded-full bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}