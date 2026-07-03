import { ShoppingCart, Lock } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    label: "Place your first order",
    sub: "Place an order of CA$21 or more before taxes and qualify for a subsidy.",
  },
  {
    label: "Referral code activates",
    sub: "Instantly unlocked after checkout",
  },
  {
    label: "Earn CA$5 per friend",
    sub: "Credited to your wallet",
  },
];

export function NotEligibleState() {
  return (
    <div className="flex min-h-screen flex-col bg-background">

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-20">
        <div className="w-full max-w-[360px]">

          {/* ── Lock badge ── */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              {/* Outer glow ring */}
              <div
                className="absolute inset-0 rounded-full blur-xl opacity-30"
                style={{ background: "var(--primary)", transform: "scale(1.4)" }}
              />
              {/* Main circle */}
              <div
                className="relative flex h-20 w-20 items-center justify-center rounded-full border border-border/60"
                style={{ background: "var(--secondary)" }}
              >
                <ShoppingCart size={32} style={{ color: "var(--primary)" }} strokeWidth={1.75} />
              </div>
              {/* Lock pip */}
              <div
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2"
                style={{
                  background: "var(--background)",
                  borderColor: "var(--border)",
                }}
              >
                <Lock size={12} style={{ color: "var(--muted-foreground)" }} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* ── Headline ── */}
          <div className="mb-8 text-center">
            <p
              className="mb-1 text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: "var(--primary)", letterSpacing: "0.15em" }}
            >
              Not yet unlocked
            </p>
            <h1
              className="mb-3 text-[26px] font-black leading-[1.15] tracking-tight"
              style={{
                fontFamily: "'Sora', system-ui, sans-serif",
                color: "var(--foreground)",
              }}
            >
              Earn CA$5 for every
              <br />friend you bring in
            </h1>
          </div>

          {/* ── Steps ── */}
          <div
            className="mb-4 rounded-2xl border overflow-hidden"
            style={{ borderColor: "var(--border)", background: "var(--card)" }}
          >
            {steps.map(({ label, sub }, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-4 py-3.5"
                style={{
                  borderBottom:
                    i < steps.length - 1
                      ? "1px solid color-mix(in oklch, var(--border) 60%, transparent)"
                      : "none",
                }}
              >
                {/* Step number */}
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black"
                  style={{
                    background: i === 0
                      ? "var(--primary)"
                      : "color-mix(in oklch, var(--primary) 12%, transparent)",
                    color: i === 0 ? "var(--primary-foreground)" : "var(--primary)",
                    fontFamily: "'Sora', system-ui, sans-serif",
                  }}
                >
                  {i + 1}
                </div>

                {/* Text */}
                <div className="min-w-0">
                  <p
                    className="text-sm font-semibold leading-tight"
                    style={{ color: "var(--foreground)" }}
                  >
                    {label}
                  </p>
                  <p className="mt-0.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {sub}
                  </p>
                </div>

              </div>
            ))}
          </div>

          {/* ── CTA ── */}
          <Link
            href="/customer/search"
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all active:scale-[0.97]"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              fontFamily: "'Sora', system-ui, sans-serif",
            }}
          >
            Start Shopping
          </Link>

          <p className="mt-3 text-center text-xs" style={{ color: "var(--muted-foreground)" }}>
            One order is all it takes to unlock your code.
          </p>
        </div>
      </div>
    </div>
  );
}