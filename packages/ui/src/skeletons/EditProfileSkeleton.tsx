function SkeletonInput() {
  return <div className="h-11 rounded-xl bg-secondary/40 animate-pulse" />;
}

function SkeletonLabel({ width = "w-20" }: { width?: string }) {
  return <div className={`h-3 ${width} rounded bg-muted animate-pulse mb-1.5`} />;
}

export function EditProfileSkeleton() {
  return (
    <div className="bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-6">
        {/* Header row */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-full border border-border/60 bg-secondary/40 animate-pulse shrink-0" />
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
        </div>

        {/* DESKTOP */}
        <div className="hidden sm:grid grid-cols-[1fr_300px] gap-5 items-start">
          <div className="rounded-3xl border border-border/60 bg-card overflow-hidden divide-y divide-border/40">
            {/* Account section */}
            <div className="px-6 py-5 space-y-4">
              <div className="h-2.5 w-24 rounded bg-muted/60 animate-pulse mb-1" />
              <div>
                <SkeletonLabel width="w-12" />
                <SkeletonInput />
              </div>
              <div>
                <SkeletonLabel width="w-16" />
                <SkeletonInput />
              </div>
            </div>

            {/* Personal info section */}
            <div className="px-6 py-5 space-y-4">
              <div className="h-2.5 w-28 rounded bg-muted/60 animate-pulse mb-1" />
              <div>
                <SkeletonLabel width="w-16" />
                <SkeletonInput />
              </div>
              <div>
                <SkeletonLabel width="w-24" />
                <SkeletonInput />
              </div>
            </div>

            {/* Address section */}
            <div className="px-6 py-5 space-y-4">
              <div className="h-2.5 w-16 rounded bg-muted/60 animate-pulse mb-1" />
              <div className="grid gap-3 sm:grid-cols-[9.5rem_minmax(0,1fr)]">
                <div>
                  <SkeletonLabel width="w-20" />
                  <SkeletonInput />
                </div>
                <div>
                  <SkeletonLabel width="w-24" />
                  <SkeletonInput />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <SkeletonLabel width="w-8" />
                  <SkeletonInput />
                </div>
                <div>
                  <SkeletonLabel width="w-14" />
                  <SkeletonInput />
                </div>
                <div>
                  <SkeletonLabel width="w-16" />
                  <SkeletonInput />
                </div>
              </div>
            </div>

            {/* Footer bar */}
            <div className="px-6 py-4 flex items-center justify-between bg-secondary/20">
              <div className="h-3 w-36 rounded bg-muted/50 animate-pulse" />
              <div className="flex items-center gap-2">
                <div className="h-9 w-20 rounded-full bg-secondary/50 animate-pulse" />
                <div className="h-9 w-32 rounded-full bg-primary/20 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Preview card */}
          <div className="rounded-3xl border border-border/60 bg-card overflow-hidden sticky top-20">
            <div className="px-5 pt-5 pb-3 border-b border-border/40">
              <div className="h-2.5 w-16 rounded bg-muted/60 animate-pulse" />
            </div>
            <div className="px-5 py-6 flex flex-col items-center text-center gap-3">
              <div className="h-20 w-20 rounded-3xl bg-secondary/40 animate-pulse" />
              <div className="space-y-2 flex flex-col items-center">
                <div className="h-4 w-28 rounded bg-muted animate-pulse" />
                <div className="h-3 w-36 rounded bg-muted/60 animate-pulse" />
              </div>
              <div className="w-full pt-3 border-t border-border/40 space-y-3">
                <div className="h-3 w-24 rounded bg-muted/50 animate-pulse" />
                <div className="h-3 w-40 rounded bg-muted/50 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE */}
        <div className="sm:hidden flex flex-col gap-4">
          <div className="flex items-center gap-4 px-1">
            <div className="h-14 w-14 rounded-2xl bg-secondary/40 animate-pulse shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-3.5 w-28 rounded bg-muted animate-pulse" />
              <div className="h-3 w-36 rounded bg-muted/60 animate-pulse" />
            </div>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card overflow-hidden divide-y divide-border/40">
            <div className="px-5 py-5 space-y-4">
              <div className="h-2.5 w-24 rounded bg-muted/60 animate-pulse" />
              <SkeletonInput />
              <SkeletonInput />
            </div>
            <div className="px-5 py-5 space-y-4">
              <div className="h-2.5 w-28 rounded bg-muted/60 animate-pulse" />
              <SkeletonInput />
              <SkeletonInput />
            </div>
            <div className="px-5 py-5 space-y-4">
              <div className="h-2.5 w-16 rounded bg-muted/60 animate-pulse" />
              <SkeletonInput />
              <div className="grid grid-cols-3 gap-3">
                <SkeletonInput />
                <SkeletonInput />
                <SkeletonInput />
              </div>
            </div>
          </div>

          <div className="w-full h-12 rounded-full bg-primary/20 animate-pulse" />
        </div>
      </div>
    </div>
  );
}