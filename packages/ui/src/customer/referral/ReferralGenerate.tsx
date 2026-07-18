"use client";

import { useState } from "react";
import { Gift, Loader2, Sparkles, Share2, Wallet } from "lucide-react";
import { GenerateReferralCode } from "@/actions/customer/ProductAndStore/Cart.Action";

const perks = [
  {
    icon: <Wallet size={13} />,
    text: "CA$5 per friend, straight to your wallet",
  },
  {
    icon: <Share2 size={13} />,
    text: "Share anywhere WhatsApp, email, or in person",
  },
  {
    icon: <Sparkles size={13} />,
    text: "Your code is permanent and unique to you",
  },
];

export function ReferralGenerate({
  customerId,
  customerName,
}: {
  customerId: string;
  customerName: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await GenerateReferralCode(customerId, customerName);
      if (res.success) {
        window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="w-full max-w-[360px]">

          {/* ── Icon ── */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full blur-xl opacity-30"
                style={{ background: "var(--primary)", transform: "scale(1.5)" }}
              />
              <div
                className="relative flex h-20 w-20 items-center justify-center rounded-full border border-border/60"
                style={{ background: "var(--secondary)" }}
              >
                <Gift size={32} style={{ color: "var(--primary)" }} strokeWidth={1.75} />
              </div>
            </div>
          </div>

          {/* ── Headline ── */}
          <div className="mb-8 text-center">
            <p
              className="mb-1 text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: "var(--primary)", letterSpacing: "0.15em" }}
            >
              One tap to activate
            </p>
            <h1
              className="mb-3 text-[26px] font-black leading-[1.15] tracking-tight"
              style={{
                fontFamily: "'Sora', system-ui, sans-serif",
                color: "var(--foreground)",
              }}
            >
              Your referral code
              <br />is ready to generate
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              Earn{" "}
              <span className="font-semibold" style={{ color: "var(--foreground)" }}>CA$5</span>
              {" "}for every friend who joins and places their first order over CA$21.
            </p>
          </div>

          {/* ── Perks ── */}
          <div
            className="mb-4 rounded-2xl border overflow-hidden"
            style={{ borderColor: "var(--border)", background: "var(--card)" }}
          >
            {perks.map(({ icon, text }, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3"
                style={{
                  borderBottom:
                    i < perks.length - 1
                      ? "1px solid color-mix(in oklch, var(--border) 60%, transparent)"
                      : "none",
                }}
              >
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: "color-mix(in oklch, var(--primary) 12%, transparent)",
                    color: "var(--primary)",
                  }}
                >
                  {icon}
                </div>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  {text}
                </p>
              </div>
            ))}
          </div>

          {/* ── CTA ── */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all active:scale-[0.97] disabled:opacity-60 disabled:pointer-events-none"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              fontFamily: "'Sora', system-ui, sans-serif",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Generating your code…
              </>
            ) : (
              <>
                <Gift size={15} />
                Generate my referral code
              </>
            )}
          </button>

          <p className="mt-3 text-center text-xs" style={{ color: "var(--muted-foreground)" }}>
            Free to generate. No limits on who you share it with.
          </p>
        </div>
      </div>
    </div>
  );
}