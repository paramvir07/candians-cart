"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Users, ArrowRight, Sparkles, Clock, Trophy } from "lucide-react";
import { DrawStats } from "@/types/promotions/draw";

interface DrawPromoCardProps {
  initialStats: DrawStats;
  href?: string;
}

export default function DrawPromoCard({
  initialStats,
  href = "/promotions",
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
      return (
        <Link
          href={href}
          className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
        >
          <div
            className="relative overflow-hidden rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow border border-amber-300/40"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.25 0.08 85) 0%, oklch(0.18 0.06 60) 100%)",
            }}
          >
            {/* Glow */}
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-amber-400/40 blur-xl pointer-events-none" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-amber-300/20 blur-lg pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-1.5 bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                <Trophy className="w-2.5 h-2.5" />
                You Won!
              </div>

              <div>
                <p className="text-amber-200/80 text-xs font-medium">
                  Grocery Gift Card Draw
                </p>
                <p className="text-2xl font-black text-amber-300 leading-tight tracking-tight">
                  🎉 You Won $50!
                </p>
                <p className="text-amber-100/70 text-xs font-medium mt-0.5">
                  You're one of our 6 lucky winners
                </p>
              </div>

              <div className="flex items-center gap-1 text-amber-400 text-xs font-bold group-hover:gap-2 transition-all">
                See your prize <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </Link>
      );
    }

    // Non-winner — show winners list card
    return (
      <Link
        href={href}
        className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
      >
        <div className="relative overflow-hidden rounded-2xl bg-primary p-5 shadow-lg hover:shadow-xl transition-shadow">
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-amber-400/20 pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
              <Trophy className="w-2.5 h-2.5" />
              Winners Announced
            </div>

            <div>
              <p className="text-primary-foreground/70 text-xs font-medium">
                Grocery Gift Card Draw
              </p>
              <p className="text-xl font-black text-primary-foreground leading-tight tracking-tight">
                6 Winners · $50 Each!
              </p>
            </div>

            <div className="space-y-1">
              {initialStats.winners.slice(0, 3).map((w, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 text-xs text-primary-foreground/80"
                >
                  <span className="w-4 h-4 rounded-full bg-amber-400/20 flex items-center justify-center text-[9px] font-black text-amber-300">
                    {i + 1}
                  </span>
                  {w.name}
                </div>
              ))}
              {initialStats.winners.length > 3 && (
                <p className="text-xs text-primary-foreground/50 pl-5">
                  +{initialStats.winners.length - 3} more
                </p>
              )}
            </div>

            <div className="flex items-center gap-1 text-amber-300 text-xs font-bold group-hover:gap-2 transition-all">
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
        className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
      >
        <div className="relative overflow-hidden rounded-2xl bg-primary p-5 shadow-lg hover:shadow-xl transition-shadow">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at top right, rgba(251,191,36,0.2) 0%, transparent 60%)",
            }}
          />
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              Draw Live Now
            </div>
            <div>
              <p className="text-primary-foreground/70 text-xs font-medium">
                Grocery Gift Card Draw
              </p>
              <p className="text-2xl font-black text-primary-foreground leading-tight tracking-tight">
                Picking winners...
              </p>
              <p className="text-primary-foreground/60 text-xs mt-0.5">
                Entry still open — winners announced live
              </p>
            </div>
            <div className="flex items-center gap-1 text-amber-300 text-xs font-bold group-hover:gap-2 transition-all">
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
      className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
    >
      <div className="relative overflow-hidden rounded-2xl bg-primary p-5 shadow-lg hover:shadow-xl transition-shadow">
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-amber-400/30 pointer-events-none" />

        <div className="relative z-10 space-y-3">
          {/* Label */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
              <Sparkles className="w-2.5 h-2.5" />
              Free Draw
            </div>
            {isParticipant && (
              <div className="inline-flex items-center gap-1 bg-green-500/20 text-green-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                You're in!
              </div>
            )}
          </div>

          {/* Prize */}
          <div>
            <p className="text-primary-foreground/70 text-xs font-medium">
              Win a grocery gift card
            </p>
            <p className="text-3xl font-black text-primary-foreground leading-tight tracking-tighter">
              6 × $50
            </p>
            <p className="text-primary-foreground/80 text-xs font-bold uppercase tracking-wider">
              Grocery Gift Cards
            </p>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 text-primary-foreground/70">
              <Users className="w-3 h-3" />
              <span>
                <span className="text-primary-foreground font-bold">
                  {initialStats.participantCount}
                </span>
                <span> entered</span>
              </span>
            </div>
            <div className="flex items-center gap-1 text-primary-foreground/70">
              <Clock className="w-3 h-3" />
              <span className="text-primary-foreground font-bold tabular-nums">
                {timeStr}
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-1 text-amber-300 text-xs font-bold group-hover:gap-2 transition-all">
            {isParticipant ? "View draw details" : "Enter for free"}{" "}
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </Link>
  );
}
