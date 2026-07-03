"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export default function EmailVerifiedClient({ type }: { type?: string }) {
  const router = useRouter();
  const isChange = type === "change";

  useEffect(() => {
    if (isChange) return;
    const t = setTimeout(() => {
      router.push("/customer");
      router.refresh();
    }, 2500);
    return () => clearTimeout(t);
  }, [isChange, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10 shadow-sm">
          <CheckCircle2 className="h-7 w-7 text-green-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {isChange ? "Email updated!" : "Email verified!"}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isChange
              ? "Your new email address has been confirmed and is now linked to your account."
              : "Your email address has been verified. You're all set."}
          </p>
          {!isChange && (
            <p className="text-xs text-muted-foreground">
              Taking you home in a moment…
            </p>
          )}
        </div>
        <button
          onClick={() => {
            router.push("/customer");
            router.refresh();
          }}
          className="w-full h-11 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Go to home
        </button>
      </div>
    </div>
  );
}