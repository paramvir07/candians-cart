"use client";

import { useState } from "react";
import {
  Users,
  Copy,
  Check,
  Share2,
  Mail,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReferralUsedBy {
  _id: string;
  name: string;
  email: string;
  placedFirstOrder: boolean;
  createdAt: string;
}

export interface ReferralDocument {
  _id: string;
  code: string;
  maxUses: number;
  expiresAt: string;
  isActive: boolean;
  uses: number;
  customerId: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  usedBy: ReferralUsedBy[];
  totalEarned: number;
}

export interface UserDataProps {
  name: string;
  placedFirstOrder: boolean;
  referralCodeEnabled: boolean;
  myreferralCodeId?: string | null;
}

interface ReferralPageClientProps {
  referralData: ReferralDocument;
  userData: UserDataProps;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

function monthLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", {
    month: "long",
    year: "numeric",
  });
}

function groupByMonth(
  usedBy: ReferralUsedBy[]
): { label: string; items: ReferralUsedBy[] }[] {
  const map = new Map<string, ReferralUsedBy[]>();
  for (const u of usedBy) {
    const key = monthLabel(u.createdAt);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(u);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .map(([label, items]) => ({ label, items }));
}

// ─── Earnings Hero ────────────────────────────────────────────────────────────

function EarningsHero({
  earned,
  uses,
  code,
}: {
  earned: string;
  uses: number;
  code: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const el = document.createElement("textarea");
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Total earned
            </p>

            <div className="mt-1 flex items-end gap-1">
              <span className="text-4xl font-bold tracking-tight text-card-foreground">
                ${earned}
              </span>

              <span className="mb-1 text-sm text-muted-foreground">
                CAD
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-primary/10 px-3 py-2 text-right">
            <p className="text-lg font-semibold text-primary">
              {uses}
            </p>
            <p className="text-[11px] text-muted-foreground">
              referrals
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">
              Reward
            </p>
            <p className="mt-1 font-semibold">
              CA$5
            </p>
          </div>

          <div className="rounded-xl border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">
              Total referrals
            </p>
            <p className="mt-1 font-semibold">
              {uses}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Referral code
          </p>

          <button
            onClick={handleCopy}
            className="group flex w-full items-center justify-between rounded-xl border bg-background px-4 py-3 transition-colors hover:bg-muted/40"
          >
            <span className="font-mono text-base font-semibold tracking-wider">
              {code}
            </span>

            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              {copied ? (
                <>
                  <Check size={16} />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Copy
                </>
              )}
            </div>
          </button>
        </div>

        <div className="mt-4 border-t pt-4">
          <ShareRow code={code} />
        </div>
      </div>
    </div>
  );
}

// ─── Share row ────────────────────────────────────────────────────────────────

function ShareRow({ code }: { code: string }) {
  const msg = `Use my referral code ${code} on Canadian Cart when you sign up!`;

  const btns = [
    {
      label: "Link",
      icon: <Share2 size={13} />,
      fn: () => navigator.clipboard.writeText(code).catch(() => {}),
    },
    {
      label: "WhatsApp",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.122 1.535 5.857L.057 23.215a.75.75 0 00.916.948l5.453-1.43A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.713 9.713 0 01-4.96-1.357l-.355-.212-3.683.966.983-3.588-.232-.369A9.722 9.722 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
        </svg>
      ),
      fn: () =>
        window.open(
          `https://wa.me/?text=${encodeURIComponent(msg)}`,
          "_blank"
        ),
    },
    {
      label: "Email",
      icon: <Mail size={13} />,
      fn: () => {
        window.location.href = `mailto:?subject=${encodeURIComponent("Join Canadian Cart")}&body=${encodeURIComponent(msg)}`;
      },
    },
  ];

  return (
    <div className="flex gap-2">
      {btns.map(({ label, icon, fn }) => (
        <button
          key={label}
          onClick={fn}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-all active:scale-95"
          style={{
            border: "1px solid #e7e5e4",
            color: "#57534e",
            background: "#fafaf9",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#f0fdf4";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#bbf7d0";
            (e.currentTarget as HTMLButtonElement).style.color = "#166534";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#fafaf9";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#e7e5e4";
            (e.currentTarget as HTMLButtonElement).style.color = "#57534e";
          }}
        >
          {icon}
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── How it works (shadcn Collapsible) ───────────────────────────────────────

function HowItWorks() {
  const [open, setOpen] = useState(false);

  const steps = [
    {
      num: "01",
      title: "Share your code",
      desc: "Send it to friends via link, WhatsApp, or email.",
    },
    {
      num: "02",
      title: "They sign up & order",
      desc: "Your friend creates an account and places their first order over CA$21.",
    },
    {
      num: "03",
      title: "CA$5 hits your gift wallet",
      desc: "Credited automatically the moment they qualify.",
    },
  ];

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className="rounded-2xl overflow-hidden bg-white"
        style={{ border: "1px solid #e7e5e4" }}
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-stone-50 focus-visible:outline-none">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-lg"
              style={{ background: "#dcfce7" }}
            >
              <span className="text-xs font-black" style={{ color: "#166534" }}>
                ?
              </span>
            </div>
            <span
              className="text-sm font-bold"
              style={{
                color: "#1c1917",
                fontFamily: "'Sora', system-ui, sans-serif",
              }}
            >
              How it works
            </span>
          </div>
          <ChevronDown
            size={16}
            className="transition-transform duration-200 shrink-0"
            style={{
              color: "#a8a29e",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div style={{ borderTop: "1px solid #f5f5f4" }}>
            {steps.map((step, i) => (
              <div
                key={i}
                className="flex items-start gap-4 px-5 py-4"
                style={{
                  borderBottom:
                    i < steps.length - 1 ? "1px solid #f5f5f4" : "none",
                }}
              >
                <span
                  className="text-xs font-black shrink-0 mt-0.5"
                  style={{
                    color: "#16a34a",
                    fontFamily: "'Sora', system-ui, sans-serif",
                    letterSpacing: "0.05em",
                    width: "20px",
                  }}
                >
                  {step.num}
                </span>
                <div>
                  <p
                    className="text-sm font-bold mb-0.5"
                    style={{
                      color: "#1c1917",
                      fontFamily: "'Sora', system-ui, sans-serif",
                    }}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "#79716b" }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// ─── Code usage ───────────────────────────────────────────────────────────────

function UsageStats({
  uses,
  maxUses,
  expiresAt,
}: {
  uses: number;
  maxUses: number;
  expiresAt: string;
}) {
  const remaining = maxUses - uses;
  const isFull = remaining <= 0;
  const segCount = Math.min(maxUses, 24);
  const filled = Math.round((uses / maxUses) * segCount);

  return (
    <div
      className="rounded-2xl bg-white px-5 py-4"
      style={{ border: "1px solid #e7e5e4" }}
    >
      <div className="flex items-center justify-between mb-4">
        <p
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "#a8a29e" }}
        >
          Code usage
        </p>
        <span className="text-xs" style={{ color: "#a8a29e" }}>
          Expires{" "}
          <span className="font-semibold" style={{ color: "#57534e" }}>
            {formatDate(expiresAt)}
          </span>
        </span>
      </div>

      {/* Segmented bar */}
      <div className="flex gap-1 mb-3">
        {Array.from({ length: segCount }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1.5 rounded-full transition-all"
            style={{
              background: i < filled ? "#16a34a" : "#e7e5e4",
            }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: "#57534e" }}>
          <span
            className="font-bold"
            style={{
              color: "#1c1917",
              fontFamily: "'Sora', system-ui, sans-serif",
            }}
          >
            {uses}
          </span>{" "}
          of {maxUses} uses
        </span>
        <span
          className="text-xs font-bold"
          style={{ color: isFull ? "#dc2626" : "#16a34a" }}
        >
          {isFull ? "Limit reached" : `${remaining} remaining`}
        </span>
      </div>
    </div>
  );
}

// ─── Month-paginated used-by list ─────────────────────────────────────────────

function UsedByList({ usedBy }: { usedBy: ReferralUsedBy[] }) {
  const months = groupByMonth(usedBy);
  const [page, setPage] = useState(0);

  if (usedBy.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: "#f5f5f4" }}
        >
          <Users size={20} style={{ color: "#a8a29e" }} />
        </div>
        <div>
          <p
            className="text-sm font-bold mb-1"
            style={{
              color: "#1c1917",
              fontFamily: "'Sora', system-ui, sans-serif",
            }}
          >
            No referrals yet
          </p>
          <p className="text-xs" style={{ color: "#79716b" }}>
            Share your code above to start earning
          </p>
        </div>
      </div>
    );
  }

  const current = months[page];
  const canPrev = page > 0;
  const canNext = page < months.length - 1;

  return (
    <div>
      {/* Month navigator */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setPage((p) => p - 1)}
          disabled={!canPrev}
          aria-label="Previous month"
          className="flex h-8 w-8 items-center justify-center rounded-xl transition-all active:scale-95 disabled:opacity-25 disabled:pointer-events-none"
          style={{ border: "1px solid #e7e5e4", background: "#fafaf9" }}
          onMouseEnter={(e) => {
            if (canPrev)
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "#166534";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#e7e5e4";
          }}
        >
          <ChevronLeft size={14} style={{ color: "#57534e" }} />
        </button>

        <div className="text-center">
          <p
            className="text-sm font-bold"
            style={{
              color: "#1c1917",
              fontFamily: "'Sora', system-ui, sans-serif",
            }}
          >
            {current.label}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#a8a29e" }}>
            {current.items.length}{" "}
            {current.items.length === 1 ? "referral" : "referrals"}
          </p>
        </div>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!canNext}
          aria-label="Next month"
          className="flex h-8 w-8 items-center justify-center rounded-xl transition-all active:scale-95 disabled:opacity-25 disabled:pointer-events-none"
          style={{ border: "1px solid #e7e5e4", background: "#fafaf9" }}
          onMouseEnter={(e) => {
            if (canNext)
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "#166534";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#e7e5e4";
          }}
        >
          <ChevronRight size={14} style={{ color: "#57534e" }} />
        </button>
      </div>

      {/* Dot indicators */}
      {months.length > 1 && (
        <div className="flex justify-center gap-1.5 mb-4">
          {months.map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              aria-label={`Go to ${months[i].label}`}
              className="h-1.5 rounded-full transition-all duration-200"
              style={{
                width: i === page ? "20px" : "6px",
                background: i === page ? "#166534" : "#d6d3d1",
              }}
            />
          ))}
        </div>
      )}

      {/* Rows */}
      <div className="flex flex-col">
        {current.items.map((u, i) => (
          <div
            key={u._id}
            className="flex items-center gap-3 py-3 transition-colors rounded-xl px-2 -mx-2"
            style={{
              borderTop: i > 0 ? "1px solid #f5f5f4" : "none",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = "#fafaf9";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.background =
                "transparent";
            }}
          >
            {/* Avatar */}
            <div
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black"
              style={{
                background: "#dcfce7",
                color: "#166534",
                fontFamily: "'Sora', system-ui, sans-serif",
                border: "2px solid #bbf7d0",
              }}
            >
              {getInitials(u.name)}
              {u.placedFirstOrder && (
                <span
                  className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full"
                  style={{
                    background: "#16a34a",
                    border: "2px solid white",
                  }}
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-bold truncate"
                style={{
                  color: "#1c1917",
                  fontFamily: "'Sora', system-ui, sans-serif",
                }}
              >
                {u.name}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#a8a29e" }}>
                Joined {formatDate(u.createdAt)}
              </p>
            </div>

            {u.placedFirstOrder ? (
              <span
                className="shrink-0 flex items-center gap-1 text-xs font-bold"
                style={{ color: "#16a34a" }}
              >
                Qualified
                <ArrowUpRight size={11} />
              </span>
            ) : (
              <span
                className="shrink-0 text-xs font-semibold uppercase tracking-wide"
                style={{ color: "#a8a29e" }}
              >
                Pending
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function ReferralPageClient({ referralData }: ReferralPageClientProps) {
  const earnedDisplay = (referralData.totalEarned / 100).toFixed(2);

  return (
    <div className="min-h-screen w-full" style={{ background: "#fafaf9" }}>

      <div
        className="relative mx-auto w-full px-4 pb-16 pt-8 sm:px-6 sm:pt-12"
        style={{ maxWidth: "520px", zIndex: 1 }}
      >
        {/* Page header */}
        <div className="mb-6">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold mb-4"
            style={{
              background: "white",
              border: "1px solid #bbf7d0",
              color: "#166534",
              boxShadow: "0 1px 4px rgba(22,101,52,0.08)",
            }}
          >
            <span
              className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block"
            />
            Referral Programme
          </div>
          <h1
            className="font-black leading-tight mb-2"
            style={{
              fontFamily: "'Sora', system-ui, sans-serif",
              fontSize: "clamp(28px, 7vw, 38px)",
              letterSpacing: "-0.03em",
              color: "#1c1917",
            }}
          >
            Refer &amp; Earn
          </h1>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "#79716b", maxWidth: "380px" }}
          >
            Earn CA$5 in gift credit for every friend who joins and places their
            first order over CA$21.
          </p>
        </div>

        {/* Earnings hero card */}
        <div className="mb-3">
          <EarningsHero
            earned={earnedDisplay}
            uses={referralData.uses}
            code={referralData.code}
          />
        </div>

        {/* How it works */}
        <div className="mb-3">
          <HowItWorks />
        </div>

        {/* Code usage */}
        <div className="mb-3">
          <UsageStats
            uses={referralData.uses}
            maxUses={referralData.maxUses}
            expiresAt={referralData.expiresAt}
          />
        </div>

        {/* People who used your code */}
        <div
          className="rounded-2xl bg-white px-5 py-4"
          style={{ border: "1px solid #e7e5e4" }}
        >
          <div className="flex items-center justify-between mb-4">
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#a8a29e" }}
            >
              People who used your code
            </p>
            {referralData.usedBy.length > 0 && (
              <span
                className="text-xs font-black px-2 py-0.5 rounded-full"
                style={{
                  background: "#dcfce7",
                  color: "#166534",
                  fontFamily: "'Sora', system-ui, sans-serif",
                }}
              >
                {referralData.usedBy.length}
              </span>
            )}
          </div>
          <UsedByList usedBy={referralData.usedBy} />
        </div>
      </div>
    </div>
  );
}