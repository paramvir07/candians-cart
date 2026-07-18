"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Trophy,
  Users,
  Clock,
  CheckCircle2,
  Facebook,
  ExternalLink,
  Sparkles,
  Star,
  Gift,
  UserPlus,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DrawStats, DrawWinner } from "@/types/promotions/draw";
import { joinDraw } from "@/actions/promotions/joinDraw.action";

// ─── TikTok icon ──────────────────────────────────────────────────────────────
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.05a8.16 8.16 0 0 0 4.77 1.52V7.12a4.85 4.85 0 0 1-1-.43z" />
    </svg>
  );
}

// ─── Countdown tile ───────────────────────────────────────────────────────────
function CountdownTile({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-card border border-border flex items-center justify-center shadow-sm relative">
        <span className="text-2xl sm:text-3xl font-black tabular-nums text-foreground">
          {String(value).padStart(2, "0")}
        </span>
        <div className="absolute inset-x-0 top-1/2 h-px bg-border pointer-events-none" />
      </div>
      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
        {label}
      </span>
    </div>
  );
}

// ─── Join success popup ───────────────────────────────────────────────────────
function JoinSuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.22 0.08 80) 0%, oklch(0.15 0.05 60) 100%)",
          border: "1px solid rgba(251,191,36,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(251,191,36,0.2) 0%, transparent 60%)",
          }}
        />

        {/* Confetti dots */}
        {[
          { top: "8%", left: "8%", size: 8, color: "#fbbf24", delay: "0s" },
          { top: "12%", left: "85%", size: 6, color: "#86efac", delay: "0.3s" },
          { top: "75%", left: "6%", size: 7, color: "#fbbf24", delay: "0.6s" },
          { top: "70%", left: "88%", size: 9, color: "#a78bfa", delay: "0.2s" },
          { top: "40%", left: "92%", size: 5, color: "#fbbf24", delay: "0.8s" },
          { top: "50%", left: "4%", size: 6, color: "#86efac", delay: "0.4s" },
        ].map((d, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              top: d.top,
              left: d.left,
              width: d.size,
              height: d.size,
              background: d.color,
              animation: `modalBounce 2.5s ${d.delay} infinite alternate`,
              opacity: 0.8,
            }}
          />
        ))}

        <style>{`
          @keyframes modalBounce {
            from { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
            to   { transform: translateY(-10px) rotate(25deg); opacity: 1; }
          }
          @keyframes popIn {
            0%   { transform: scale(0.8); opacity: 0; }
            70%  { transform: scale(1.04); }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>

        <div
          className="relative z-10 p-8 text-center space-y-5"
          style={{
            animation: "popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards",
          }}
        >
          <div className="text-7xl leading-none select-none">🎉</div>

          <div className="space-y-1.5">
            <p className="text-amber-300/70 text-xs font-bold uppercase tracking-widest">
              You're officially in!
            </p>
            <h2 className="text-3xl font-black text-amber-300 tracking-tight leading-none">
              Good Luck! 🍀
            </h2>
            <p className="text-amber-100/60 text-sm leading-relaxed mt-2">
              You've entered the draw for a{" "}
              <span className="text-amber-300 font-bold">
                $50 Grocery Gift Card
              </span>
              . Winners will be announced at our{" "}
              <span className="text-amber-300 font-bold">
                live event on June 27
              </span>{" "}
              — keep an eye on this page!
            </p>
          </div>

          <div className="inline-flex items-center gap-2 bg-amber-400 text-amber-950 font-black text-sm px-5 py-2.5 rounded-full shadow-lg shadow-amber-900/30">
            <Gift className="w-4 h-4" />6 × $50 Gift Cards to be won
          </div>

          <p className="text-amber-200/40 text-xs">
            Check back on June 27 — winners announced live!
          </p>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 transition-colors text-amber-200 font-bold text-sm border border-white/10"
          >
            Got it — fingers crossed! 🤞
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Winner celebration (winner POV) ─────────────────────────────────────────
function WinnerCelebration({ winners }: { winners: DrawWinner[] }) {
  return (
    <div className="space-y-8">
      <div
        className="relative overflow-hidden rounded-3xl border border-amber-300/30 p-8 text-center"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.08 80) 0%, oklch(0.16 0.05 60) 100%)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)",
            }}
          />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="text-6xl">🎉</div>
          <div>
            <p className="text-amber-300/80 text-sm font-semibold uppercase tracking-widest">
              Grocery Gift Card Draw
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-amber-300 tracking-tight leading-none mt-1">
              You Won!
            </h2>
            <p className="text-amber-100/60 text-base mt-2">
              You're one of our 6 lucky winners — your{" "}
              <span className="text-amber-300 font-bold">
                $50 grocery gift card
              </span>{" "}
              is ready to use.
            </p>
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-amber-400 text-amber-950 font-black px-5 py-2 rounded-full text-sm">
              <Gift className="w-4 h-4" />
              You won a $50 Grocery Gift Card!
            </div>
            <p className="text-amber-200/60 text-xs">
              Redeem it at{" "}
              <span className="text-amber-300 font-bold">
                Sunfarm Produce — Abbotsford
              </span>
            </p>
          </div>
        </div>
      </div>
      <WinnersList winners={winners} highlightSelf />
    </div>
  );
}

// ─── Winners list ─────────────────────────────────────────────────────────────
function WinnersList({
  winners,
  highlightSelf = false,
}: {
  winners: DrawWinner[];
  highlightSelf?: boolean;
}) {
  const trophyColors = ["text-amber-400", "text-slate-400", "text-amber-700"];
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-black text-foreground tracking-tight">
          🏆 Our 6 Lucky Winners
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          $50 Grocery Gift Card each — Grand Launch 2026
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {winners.map((w, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 p-4 rounded-2xl border ${
              highlightSelf && i === 0
                ? "bg-amber-400/10 border-amber-400/30"
                : "bg-muted/30 border-border"
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center shrink-0">
              <Trophy
                className={`w-4 h-4 ${trophyColors[i] ?? "text-muted-foreground"}`}
              />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">{w.name}</p>
              <p className="text-xs text-muted-foreground">Winner #{i + 1}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Entry steps ──────────────────────────────────────────────────────────────
function EntrySteps({
  myStatus,
  participantCount,
  dark = false,
}: {
  myStatus: DrawStats["myStatus"];
  participantCount: number;
  dark?: boolean;
}) {
  const isLoggedIn = myStatus !== null;
  const hasJoined = myStatus === "participant" || myStatus === "winner";

  const [fbClicked, setFbClicked] = useState(false);
  const [ttClicked, setTtClicked] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [joinResult, setJoinResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
  } | null>(null);
  const [showModal, setShowModal] = useState(false);

  const bothClicked = fbClicked && ttClicked;
  const canJoin = isLoggedIn && bothClicked && !hasJoined;

  function handleJoin() {
    startTransition(async () => {
      const result = await joinDraw();
      setJoinResult(result);
      if (result.success) setShowModal(true);
    });
  }

  const steps = [
    {
      num: 1,
      title: "Create an account or log in",
      description: "Join Candian's Cart as a member — it's free.",
      done: isLoggedIn,
      content: !isLoggedIn ? (
        <a href="/customer/signup">
          <Button size="sm" className="gap-2 mt-2">
            <UserPlus className="w-3.5 h-3.5" /> Create account
          </Button>
        </a>
      ) : null,
    },
    {
      num: 2,
      title: "Follow us on Facebook & TikTok",
      description:
        "Click both links — the Join button unlocks once you've visited both.",
      done: hasJoined || bothClicked,
      disabled: !isLoggedIn,
      content: !hasJoined ? (
        <div className="flex flex-wrap gap-2 mt-2">
          <a
            href="https://www.facebook.com/canadianscart"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setFbClicked(true)}
            className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl border transition-all ${
              isLoggedIn
                ? dark
                  ? "bg-blue-900/50 text-blue-300 border-blue-700/60 hover:bg-blue-800/50"
                  : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                : "opacity-40 pointer-events-none bg-muted text-muted-foreground border-border"
            } ${fbClicked ? "ring-2 ring-blue-400/50" : ""}`}
          >
            <Facebook className="w-3.5 h-3.5" />
            Facebook
            {fbClicked && <CheckCircle2 className="w-3 h-3 text-green-500" />}
            <ExternalLink className="w-2.5 h-2.5 opacity-50" />
          </a>
          <a
            href="https://www.tiktok.com/@canadianscart?_r=1&_t=ZS-97YOxQWY2lj"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setTtClicked(true)}
            className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl border transition-all ${
              isLoggedIn
                ? dark
                  ? "bg-white/10 text-white/80 border-white/20 hover:bg-white/15"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                : "opacity-40 pointer-events-none bg-muted text-muted-foreground border-border"
            } ${ttClicked ? "ring-2 ring-slate-400/50" : ""}`}
          >
            <TikTokIcon className="w-3.5 h-3.5" />
            TikTok
            {ttClicked && <CheckCircle2 className="w-3 h-3 text-green-500" />}
            <ExternalLink className="w-2.5 h-2.5 opacity-50" />
          </a>
        </div>
      ) : null,
    },
    {
      num: 3,
      title: "Join the draw",
      description:
        "One click enters you — winners announced live at the event.",
      done: hasJoined,
      disabled: !canJoin,
      content: !hasJoined ? (
        <div className="mt-2 space-y-2">
          <Button
            size="sm"
            className="gap-2"
            disabled={!canJoin || isPending}
            onClick={handleJoin}
          >
            <Gift className="w-3.5 h-3.5" />
            {isPending ? "Joining..." : "Join the draw"}
          </Button>
          {!bothClicked && isLoggedIn && (
            <p
              className={`text-xs ${dark ? "text-red-200/50" : "text-muted-foreground"}`}
            >
              Follow us on both platforms first to unlock this.
            </p>
          )}
          {joinResult && !joinResult.success && (
            <p className="text-xs text-destructive">{joinResult.error}</p>
          )}
        </div>
      ) : null,
    },
  ];

  return (
    <>
      {showModal && <JoinSuccessModal onClose={() => setShowModal(false)} />}
      <div className="space-y-6">
        {(hasJoined || joinResult?.success) && (
          <div
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 border ${dark ? "bg-green-500/15 border-green-500/25" : "bg-green-500/10 border-green-500/20"}`}
          >
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            <div>
              <p
                className={`font-bold text-sm ${dark ? "text-white" : "text-foreground"}`}
              >
                You're in the draw!
              </p>
              <p
                className={`text-xs ${dark ? "text-red-200/50" : "text-muted-foreground"}`}
              >
                Winners will be announced live. Keep this page open!
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users
            className={`w-4 h-4 ${dark ? "text-red-300" : "text-primary"}`}
          />
          <span className={dark ? "text-red-200/60" : ""}>
            <span
              className={`font-bold ${dark ? "text-white" : "text-foreground"}`}
            >
              {participantCount}
            </span>{" "}
            people have entered
          </span>
        </div>

        <div className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.num}
              className={`relative flex gap-4 p-4 rounded-2xl border transition-colors ${
                step.done
                  ? "bg-green-500/10 border-green-500/25"
                  : step.disabled
                    ? `opacity-40 ${dark ? "bg-white/5 border-white/10" : "bg-muted/20 border-border"}`
                    : dark
                      ? "bg-white/8 border-white/15"
                      : "bg-card border-border"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 font-black text-xs ${
                  step.done
                    ? "bg-green-500 text-white"
                    : dark
                      ? "bg-white/15 text-white/80"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {step.done ? <CheckCircle2 className="w-4 h-4" /> : step.num}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`font-bold text-sm ${dark ? "text-white" : "text-foreground"}`}
                >
                  {step.title}
                </p>
                <p
                  className={`text-xs mt-0.5 ${dark ? "text-red-100/50" : "text-muted-foreground"}`}
                >
                  {step.description}
                </p>
                {step.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Live event banner ────────────────────────────────────────────────────────
// Shows during the 2pm–4pm event window. Entry still open with full 3-step flow.
// Winners NOT necessarily announced here — admin does that whenever ready.
function LiveEventBanner({
  myStatus,
  participantCount,
}: {
  myStatus: DrawStats["myStatus"];
  participantCount: number;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-red-500/30 p-6 sm:p-8 space-y-6"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.18 0.07 20) 0%, oklch(0.13 0.04 10) 100%)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(239,68,68,0.15) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 space-y-5">
        {/* Live badge */}
        <div className="inline-flex items-center gap-2 bg-red-500 text-white font-black text-sm px-4 py-1.5 rounded-full shadow-lg shadow-red-500/30 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-white" />
          Event Live Now
        </div>

        {/* Headline */}
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            🎲 The draw is happening today!
          </h2>
          <p className="text-red-200/60 text-sm">
            You can still enter! Winners will be announced here whenever we're
            ready — keep this page open.
          </p>
        </div>

        <Separator className="border-white/10" />

        {/* Same 3-step entry flow — themed for dark background */}
        <div className="space-y-2">
          <h3 className="text-sm font-black text-white uppercase tracking-widest">
            How to enter
          </h3>
          <p className="text-xs text-red-200/50">
            Still open — completely free
          </p>
        </div>

        <EntrySteps
          myStatus={myStatus}
          participantCount={participantCount}
          dark
        />

        {/* Refresh hint */}
        <button
          onClick={() => window.location.reload()}
          className="text-xs font-bold text-red-300/50 hover:text-red-300 transition-colors underline underline-offset-2"
        >
          Refresh to check for winner announcements
        </button>
      </div>
    </div>
  );
}

// ─── Main DrawPromoSection ────────────────────────────────────────────────────
interface DrawPromoSectionProps {
  initialStats: DrawStats;
}

export default function DrawPromoSection({
  initialStats,
}: DrawPromoSectionProps) {
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

  return (
    <section className="py-10 px-4 bg-background">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* ── Hero header ─────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-primary pt-10 pb-12 px-6 text-center">
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 25% 50%, white 1px, transparent 1px), radial-gradient(circle at 75% 50%, white 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-amber-400/20 blur-xl pointer-events-none" />
          <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-amber-300/10 blur-lg pointer-events-none" />

          <div className="relative z-10 space-y-3">
            {initialStats.phase === "announced" ? (
              <div className="inline-flex items-center gap-2 bg-amber-400 text-amber-950 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow">
                <Trophy className="w-3 h-3" /> Winners Announced{" "}
                <Trophy className="w-3 h-3" />
              </div>
            ) : initialStats.phase === "live_event" ? (
              <div className="inline-flex items-center gap-2 bg-red-500 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white" /> Live Now
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-amber-400 text-amber-950 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow">
                <Sparkles className="w-3 h-3" /> Free Grocery Draw{" "}
                <Sparkles className="w-3 h-3" />
              </div>
            )}

            <div>
              <p className="text-primary-foreground/70 text-sm font-medium uppercase tracking-wide">
                Grand Launch — 6 winners
              </p>
              <h2 className="text-5xl sm:text-6xl font-black text-primary-foreground leading-none tracking-tighter mt-1">
                WIN
              </h2>
              <p className="text-3xl sm:text-4xl font-black text-amber-300 leading-none">
                $50 Grocery Gift Cards
              </p>
              <p className="text-primary-foreground/50 text-sm font-medium mt-1">
                $50 each · 6 lucky winners
              </p>
            </div>

            <p className="text-primary-foreground/60 text-sm max-w-sm mx-auto">
              Follow us on Facebook & TikTok, join the draw, and be one of 6
              lucky winners.
            </p>

            {initialStats.myStatus === "participant" &&
              initialStats.phase !== "announced" && (
                <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-300 border border-green-500/30 text-xs font-bold px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> You're in the draw — good
                  luck!
                </div>
              )}
          </div>
        </div>

        {/* ── Phase content ────────────────────────────────────────────────── */}
        {initialStats.phase === "announced" &&
        initialStats.myStatus === "winner" ? (
          <WinnerCelebration winners={initialStats.winners} />
        ) : initialStats.phase === "announced" ? (
          <div className="space-y-6">
            <WinnersList winners={initialStats.winners} />
            <div className="bg-muted/30 rounded-2xl p-4 text-center space-y-1">
              <p className="text-sm font-semibold text-foreground">
                Each winner receives a{" "}
                <span className="text-amber-500">$50 Grocery Gift Card</span> 🎁
              </p>
              <p className="text-sm text-muted-foreground">
                Thank you to everyone who participated in our Grand Launch Draw!
                🎉
              </p>
            </div>
          </div>
        ) : initialStats.phase === "live_event" ? (
          <LiveEventBanner
            myStatus={initialStats.myStatus}
            participantCount={initialStats.participantCount}
          />
        ) : (
          // pre_event — countdown + entry steps
          <div className="space-y-8">
            <Card className="p-6 space-y-4">
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <Clock className="w-3.5 h-3.5" /> Event goes live
                </div>
                <p className="text-sm text-muted-foreground">
                  June 27, 2026 · 2:00 PM Pacific Time
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Winners announced live at the event — could be any time after
                  2 PM
                </p>
              </div>
              <div className="flex items-start justify-center gap-2 sm:gap-3">
                <CountdownTile value={days} label="Days" />
                <div className="text-2xl font-black text-primary mt-3">:</div>
                <CountdownTile value={hours} label="Hours" />
                <div className="text-2xl font-black text-primary mt-3">:</div>
                <CountdownTile value={minutes} label="Mins" />
                <div className="text-2xl font-black text-primary mt-3">:</div>
                <CountdownTile value={secs} label="Secs" />
              </div>
            </Card>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-black text-foreground tracking-tight">
                  How to enter
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  3 easy steps — completely free
                </p>
              </div>
              <EntrySteps
                myStatus={initialStats.myStatus}
                participantCount={initialStats.participantCount}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
