"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Users,
  ArrowRight,
  Sparkles,
  Clock,
  Trophy,
  Gift,
  CheckCircle2,
} from "lucide-react";
import { DrawStats } from "@/types/promotions/draw";

interface DrawPromoCardProps {
  initialStats: DrawStats;
  href?: string;
}

export default function DrawPromoCard({
  initialStats,
  href = "/promotions#grocery-gift-draw",
}: DrawPromoCardProps) {
  const [secondsLeft, setSecondsLeft] = useState(
    initialStats.secondsUntilEvent,
  );

  useEffect(() => {
    if (initialStats.phase !== "pre_event") return;
    if (secondsLeft <= 0) return;
    const id = setInterval(
      () => setSecondsLeft((s) => Math.max(0, s - 1)),
      1000,
    );
    return () => clearInterval(id);
  }, [initialStats.phase, secondsLeft]);

  const pad = (n: number) => String(n).padStart(2, "0");
  const days = Math.floor(secondsLeft / 86400);
  const hours = Math.floor((secondsLeft % 86400) / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const secs = secondsLeft % 60;

  const timeStr =
    days > 0
      ? `${days}d ${pad(hours)}h ${pad(minutes)}m`
      : `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;

  // ── Announced phase: show winners ─────────────────────────────────────────
  if (initialStats.phase === "announced") {
    const isWinner = initialStats.myStatus === "winner";

    if (isWinner) {
      const hasRedeemed = initialStats.myHasRedeemed === true;

      return (
        <Link
          href={href}
          className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-2xl"
        >
          <div
            className="relative overflow-hidden rounded-2xl p-5 shadow-[0_4px_20px_rgba(180,140,40,0.2)] hover:shadow-[0_8px_28px_rgba(180,140,40,0.3)] hover:-translate-y-0.5 transition-all duration-300 border-2 border-amber-300"
            style={{
              background:
                "linear-gradient(155deg, #fffaf0 0%, #fdf3dd 45%, #fbeecb 100%)",
            }}
          >
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-amber-300/25 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-amber-200/25 blur-xl pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
                  <Trophy className="w-2.5 h-2.5" />
                  Winner
                </div>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>

              <div>
                <p className="text-amber-700/70 text-xs font-bold uppercase tracking-wider">
                  Grocery Gift Card Draw
                </p>
                <p className="text-3xl font-black leading-tight tracking-tight bg-gradient-to-b from-amber-500 to-amber-600 bg-clip-text text-transparent">
                  🎉 You Won $50!
                </p>
                <p className="text-stone-500 text-xs font-medium mt-0.5">
                  One of 6 lucky winners in our Grand Launch draw
                </p>
              </div>

              {hasRedeemed ? (
                <div className="inline-flex items-center gap-1.5 bg-stone-100 text-stone-500 text-[11px] font-bold px-2.5 py-1.5 rounded-full border border-stone-200 w-fit">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  Gift card already redeemed
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-[11px] font-black px-3 py-1.5 rounded-full border border-amber-300 w-fit">
                  <Gift className="w-3 h-3" />
                  Not redeemed — claim anytime
                </div>
              )}

              <div className="flex items-center gap-1 text-amber-600 text-xs font-black group-hover:gap-2 transition-all">
                {hasRedeemed ? "View details" : "Redeem your prize"}{" "}
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </Link>
      );
    }

    // Non-winner — show winners list card
    const previewWinners = initialStats.winners.slice(0, 2);
    const hiddenCount = initialStats.winners.length - previewWinners.length;

    return (
      <Link
        href={href}
        className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-2xl"
      >
        <div
          className="relative overflow-hidden rounded-2xl shadow-[0_4px_20px_rgba(180,140,40,0.18)] hover:shadow-[0_8px_28px_rgba(180,140,40,0.28)] hover:-translate-y-0.5 transition-all duration-300 border border-amber-300/50"
          style={{
            background:
              "linear-gradient(155deg, #fffaf0 0%, #fdf3dd 45%, #fbeecb 100%)",
          }}
        >
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-amber-300/20 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-4 w-20 h-20 rounded-full bg-amber-200/25 blur-xl pointer-events-none" />

          <div className="relative z-10 p-5">
            {/* Label */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
                <Trophy className="w-2.5 h-2.5" />
                Winners Announced
              </div>
            </div>

            {/* Headline */}
            <div className="mb-3">
              <p className="text-amber-700/70 text-xs font-bold uppercase tracking-wider">
                Grocery Gift Card Draw
              </p>
              <p className="text-4xl font-black leading-tight tracking-tighter bg-gradient-to-b from-amber-500 to-amber-600 bg-clip-text text-transparent">
                6 × $50
              </p>
              <p className="text-stone-700 text-xs font-bold uppercase tracking-wider">
                Winners Each
              </p>
            </div>

            {/* Winner preview row */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              {previewWinners.map((w, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-1.5 text-xs text-stone-700 bg-white/70 border border-amber-200/60 rounded-full pl-1 pr-2.5 py-1"
                >
                  <span className="flex items-center justify-center rounded-full bg-amber-400 text-[9px] font-black text-white shrink-0 w-[18px] h-[18px]">
                    {i + 1}
                  </span>
                  <span className="font-bold">{w.name}</span>
                </div>
              ))}
              {hiddenCount > 0 && (
                <div className="inline-flex items-center text-xs text-stone-500 font-bold bg-white/50 rounded-full px-2.5 py-1">
                  +{hiddenCount} more
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="flex items-center gap-1 text-amber-600 text-xs font-black group-hover:gap-2 transition-all">
              See all winners <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // ── Live draw phase ───────────────────────────────────────────────────────
  if (initialStats.phase === "live_event") {
    return (
      <Link
        href={href}
        className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-2xl"
      >
        <div
          className="relative overflow-hidden rounded-2xl shadow-[0_4px_20px_rgba(180,140,40,0.18)] hover:shadow-[0_8px_28px_rgba(180,140,40,0.28)] hover:-translate-y-0.5 transition-all duration-300 border border-amber-300/50"
          style={{
            background:
              "linear-gradient(155deg, #fffaf0 0%, #fdf3dd 45%, #fbeecb 100%)",
          }}
        >
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-amber-300/20 blur-2xl pointer-events-none" />
          <div className="relative z-10 p-5">
            <div className="mb-3">
              <div className="inline-flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                Draw Live Now
              </div>
            </div>
            <div className="mb-3">
              <p className="text-amber-700/70 text-xs font-bold uppercase tracking-wider">
                Grocery Gift Card Draw
              </p>
              <p className="text-2xl font-black text-stone-800 leading-tight tracking-tight">
                Picking winners...
              </p>
              <p className="text-stone-500 text-xs mt-0.5">
                Entry still open — winners announced live
              </p>
            </div>
            <div className="flex items-center gap-1 text-amber-600 text-xs font-bold group-hover:gap-2 transition-all">
              Enter now or see results <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // ── Pre-draw phase (default) ──────────────────────────────────────────────
  const isParticipant = initialStats.myStatus === "participant";

  return (
    <Link
      href={href}
      className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-2xl"
    >
      <div
        className="relative overflow-hidden rounded-2xl shadow-[0_4px_20px_rgba(180,140,40,0.18)] hover:shadow-[0_8px_28px_rgba(180,140,40,0.28)] hover:-translate-y-0.5 transition-all duration-300 border border-amber-300/50"
        style={{
          background:
            "linear-gradient(155deg, #fffaf0 0%, #fdf3dd 45%, #fbeecb 100%)",
        }}
      >
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-amber-300/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-4 w-20 h-20 rounded-full bg-amber-200/25 blur-xl pointer-events-none" />

        <div className="relative z-10 p-5">
          {/* Label */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
              <Sparkles className="w-2.5 h-2.5" />
              Free Draw
            </div>
            {isParticipant && (
              <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                You're in!
              </div>
            )}
          </div>

          {/* Prize */}
          <div className="mb-3">
            <p className="text-amber-700/70 text-xs font-bold uppercase tracking-wider">
              Win a grocery gift card
            </p>
            <p className="text-4xl font-black leading-tight tracking-tighter bg-gradient-to-b from-amber-500 to-amber-600 bg-clip-text text-transparent">
              6 × $50
            </p>
            <p className="text-stone-700 text-xs font-bold uppercase tracking-wider">
              Grocery Gift Cards
            </p>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 text-xs mb-3">
            <div className="flex items-center gap-1 text-stone-500">
              <Users className="w-3 h-3" />
              <span>
                <span className="text-stone-800 font-bold">
                  {initialStats.participantCount}
                </span>
                <span> entered</span>
              </span>
            </div>
            <div className="flex items-center gap-1 text-stone-500">
              <Clock className="w-3 h-3" />
              <span className="text-stone-800 font-bold tabular-nums">
                {timeStr}
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-1 text-amber-600 text-xs font-black group-hover:gap-2 transition-all">
            {isParticipant ? "View draw details" : "Enter for free"}{" "}
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </Link>
  );
}
