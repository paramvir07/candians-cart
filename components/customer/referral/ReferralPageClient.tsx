"use client";

import { useEffect, useState } from "react";
import {
  Copy,
  Check,
  Share2,
  Mail,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  DollarSign,
  Settings,
  Settings2,
  CheckCircle2,
  Gift,
  Repeat2,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { setReferralInvites } from "@/actions/customer/ReferralAction";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

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
  recieveReferralInvites: boolean;
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

function getReferralUrl(code: string): string {
  return `https://www.canadianscart.ca/?referralCode=${encodeURIComponent(code)}&heard=referred_by_customer`;
}

function getReferralShareMessage(code: string): string {
  const url = getReferralUrl(code);

  return `🛒 Canadian's Cart (CC) is now live at Sunfarm Produce, Abbotsford, BC!

🎁 Join & you could win a $500 grocery gift card

✨ Perks:
• Free groceries like milk, atta & ghee on sign-up offers
• Exclusive launch rewards for new members

📲 Use referral code: ${code}

📍 Location: 3670 Town Line Rd #108, Abbotsford, BC

🔗 Sign up here: ${url}

━━━━━━━━━━━━━━
📢 Follow us for updates
📸 Instagram: https://www.instagram.com/canadianscart
📘 Facebook: https://www.facebook.com/canadianscart
🎥 TikTok: https://vt.tiktok.com/ZSxjaYrjL/`;
}

// ─── Earnings Hero ────────────────────────────────────────────────────────────

function EarningsHero({
  earned,
  uses,
  code,
  maxUses,
}: {
  earned: string;
  uses: number;
  maxUses: number;
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
    <div className="rounded-2xl overflow-hidden border border-border/60 shadow-sm">
      {/* ── Dark green top ── */}
      <div
        className="relative px-5 pt-5 pb-5 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.6271 0.1699 149.2138) 0%, oklch(0.4104 0.1066 149.9393) 100%)",
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/[0.08] pointer-events-none" />
        <div className="absolute top-4 right-20 w-10 h-10 rounded-full bg-white/10 pointer-events-none" />

        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50 mb-1 relative">
          Total earned
        </p>

        <div className="flex items-end gap-1.5 mb-5 relative">
          <span
            className="text-5xl font-black tracking-tight text-white leading-none"
            style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
          >
            ${earned}
          </span>
          <span className="text-sm text-white/50 mb-1.5">CAD</span>
        </div>

        <div className="grid grid-cols-3 gap-2 relative">
          <div className="rounded-xl bg-white/10 border border-white/10 px-3 py-2.5">
            <p className="text-[10px] text-white/50 mb-1">Per referral</p>
            <p
              className="text-base font-bold text-white"
              style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
            >
              CA$5
            </p>
          </div>
          <div className="rounded-xl bg-white/10 border border-white/10 px-3 py-2.5">
            <p className="text-[10px] text-white/50 mb-1">Referred</p>
            <p
              className="text-base font-bold text-white"
              style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
            >
              {uses}
            </p>
          </div>
          <div className="rounded-xl bg-white/10 border border-white/10 px-3 py-2.5">
            <p className="text-[10px] text-white/50 mb-1">Left to earn</p>
            <p
              className="text-base font-bold text-white"
              style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
            >
              CA${maxUses - uses > 0 ? (maxUses - uses) * 5 : 0}
            </p>
          </div>
        </div>
      </div>

      {/* ── White bottom ── */}
      <div className="bg-card px-5 pt-4 pb-5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
          Your referral code
        </p>

        <button
          onClick={handleCopy}
          className="group flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-3 transition-colors hover:bg-muted/40 hover:border-primary/40"
        >
          <span className="font-mono text-base font-bold tracking-wider text-foreground">
            {code}
          </span>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
            {copied ? (
              <>
                <Check size={15} />
                Copied
              </>
            ) : (
              <>
                <Copy size={15} />
                Copy
              </>
            )}
          </div>
        </button>

        <div className="mt-3 border-t border-border/60 pt-3">
          <ShareRow code={code} />
        </div>
      </div>
    </div>
  );
}

// ─── Share row ────────────────────────────────────────────────────────────────

function ShareRow({ code }: { code: string }) {
  const msg = getReferralShareMessage(code);
  const url = getReferralUrl(code);
  const [linkCopied, setLinkCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(msg).catch(() => {});
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1800);
  }

  const btns = [
    {
      label: linkCopied ? "Copied" : "Link",
      icon: linkCopied ? <Check size={13} /> : <Share2 size={13} />,
      fn: copyLink,
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
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank"),
    },
    {
      label: "Email",
      icon: <Mail size={13} />,
      fn: () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(
          "Join Canadian Cart"
        )}&body=${encodeURIComponent(msg)}`;
      },
    },
  ];

  return (
    <div className="flex gap-2">
      {btns.map(({ label, icon, fn }) => (
        <button
          key={label}
          onClick={fn}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-xs font-semibold text-muted-foreground bg-background transition-all active:scale-95 hover:bg-primary/5 hover:border-primary/40 hover:text-primary"
        >
          {icon}
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────

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
      <div className="rounded-2xl overflow-hidden bg-card border border-border/60">
        <CollapsibleTrigger className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10">
              <span className="text-xs font-black text-primary">?</span>
            </div>
            <span
              className="text-sm font-bold text-foreground"
              style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
            >
              How it works
            </span>
          </div>
          <ChevronDown
            size={16}
            className="text-muted-foreground shrink-0 transition-transform duration-200"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </CollapsibleTrigger>

        <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
          <div className="border-t border-border/60">
            {steps.map((step, i) => (
              <div
                key={i}
                className="flex items-start gap-4 px-5 py-4"
                style={{
                  borderBottom:
                    i < steps.length - 1
                      ? "1px solid hsl(var(--border) / 0.4)"
                      : "none",
                }}
              >
                <span
                  className="text-xs font-black shrink-0 mt-0.5 text-primary"
                  style={{
                    fontFamily: "'Sora', system-ui, sans-serif",
                    letterSpacing: "0.05em",
                    width: "20px",
                  }}
                >
                  {step.num}
                </span>
                <div>
                  <p
                    className="text-sm font-bold text-foreground mb-0.5"
                    style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
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

// ─── Usage stats ──────────────────────────────────────────────────────────────

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
    <div className="rounded-2xl bg-card border border-border/60 px-5 py-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Code usage
        </p>
        <span className="text-xs text-muted-foreground">
          Expires{" "}
          <span className="font-semibold text-foreground">
            {formatDate(expiresAt)}
          </span>
        </span>
      </div>

      <div className="flex gap-1 mb-3">
        {Array.from({ length: segCount }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1.5 rounded-full transition-all"
            style={{
              background:
                i < filled
                  ? "oklch(0.5271 0.1699 149.2138)"
                  : "hsl(var(--border))",
            }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          <span
            className="font-bold text-foreground"
            style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
          >
            {uses}
          </span>{" "}
          of {maxUses} uses
        </span>
        <span
          className="text-xs font-bold"
          style={{
            color: isFull
              ? "hsl(var(--destructive))"
              : "oklch(0.5271 0.1699 149.2138)",
          }}
        >
          {isFull ? "Limit reached" : `${remaining} remaining`}
        </span>
      </div>
    </div>
  );
}

// ─── Ghost Row ────────────────────────────────────────────────────────────────

function GhostRow({ style }: { style?: React.CSSProperties }) {
  return (
    <div className="flex items-center gap-3 py-3 px-2 -mx-2" style={style}>
      <div className="h-10 w-10 shrink-0 rounded-full bg-muted/60 border-2 border-dashed border-border/60" />
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="h-3 w-24 rounded-full bg-muted/60" />
        <div className="h-2.5 w-16 rounded-full bg-muted/40" />
      </div>
      <span className="shrink-0 text-xs font-semibold text-muted-foreground/40 border border-dashed border-border/40 px-2 py-1 rounded-full">
        CA$5
      </span>
    </div>
  );
}

// ─── Used-by list ─────────────────────────────────────────────────────────────

function UsedByList({
  usedBy,
  maxUses,
}: {
  usedBy: ReferralUsedBy[];
  maxUses: number;
}) {
  const months = groupByMonth(usedBy);
  const [page, setPage] = useState(0);

  const remainingSlots = Math.max(0, maxUses - usedBy.length);
  const currentMonthLabel = new Date().toLocaleDateString("en-CA", {
    month: "long",
    year: "numeric",
  });

  // Empty state — all ghosts
  if (usedBy.length === 0) {
    return (
      <div>
        {Array.from({ length: Math.min(remainingSlots, 5) }).map((_, i) => (
          <GhostRow
            key={i}
            style={{
              borderTop:
                i > 0
                  ? "1px solid hsl(var(--border) / 0.5)"
                  : undefined,
            }}
          />
        ))}
        {remainingSlots > 5 && (
          <p className="text-[10px] text-center text-muted-foreground/50 pt-3">
            +{remainingSlots - 5} more open spots · CA${remainingSlots * 5}{" "}
            left to earn
          </p>
        )}
      </div>
    );
  }

  const current = months[page];
  const isCurrentMonth = current.label === currentMonthLabel;
  const ghostsForMonth = isCurrentMonth ? remainingSlots : 0;
  const canPrev = page > 0;
  const canNext = page < months.length - 1;

  return (
    <TooltipProvider delayDuration={0}>
      <div>
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={!canPrev}
            aria-label="Previous month"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-background transition-all active:scale-95 disabled:opacity-25 disabled:pointer-events-none hover:border-primary/50"
          >
            <ChevronLeft size={14} className="text-muted-foreground" />
          </button>

          <div className="text-center">
            <p
              className="text-sm font-bold text-foreground"
              style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
            >
              {current.label}
            </p>
            <p className="text-xs mt-0.5 text-muted-foreground">
              {current.items.length}{" "}
              {current.items.length === 1 ? "referral" : "referrals"}
              {ghostsForMonth > 0 && (
                <span className="text-primary font-semibold">
                  {" "}
                  · CA${ghostsForMonth * 5} left
                </span>
              )}
            </p>
          </div>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!canNext}
            aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-background transition-all active:scale-95 disabled:opacity-25 disabled:pointer-events-none hover:border-primary/50"
          >
            <ChevronRight size={14} className="text-muted-foreground" />
          </button>
        </div>

        {/* Pagination dots */}
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
                  background:
                    i === page
                      ? "oklch(0.5271 0.1699 149.2138)"
                      : "hsl(var(--border))",
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
              className="flex items-center gap-3 py-3 px-2 -mx-2 rounded-xl transition-colors hover:bg-muted/40"
              style={{
                borderTop:
                  i > 0
                    ? "1px solid hsl(var(--border) / 0.5)"
                    : undefined,
              }}
            >
              <Avatar className="h-10 w-10 shrink-0 ring-2 ring-primary/20 rounded-full">
                <AvatarImage
                  src={`https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(u.name)}`}
                  className="rounded-full"
                />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold rounded-full">
                  {u.name
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0]?.toUpperCase() ?? "")
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-bold text-foreground truncate"
                  style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
                >
                  {u.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Joined {formatDate(u.createdAt)}
                </p>
              </div>

              {u.placedFirstOrder ? (
                <span className="shrink-0 flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded-full">
                  <DollarSign size={11} />
                  CA$5
                </span>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="shrink-0 text-xs font-semibold text-muted-foreground bg-muted border border-border px-2 py-1 rounded-full cursor-default">
                      Pending
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Hasn't placed an order yet
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          ))}

          {/* Ghost slots for current month */}
          {ghostsForMonth > 0 &&
            Array.from({ length: ghostsForMonth }).map((_, i) => (
              <GhostRow
                key={`ghost-${i}`}
                style={{ borderTop: "1px solid hsl(var(--border) / 0.5)" }}
              />
            ))}
        </div>
      </div>
    </TooltipProvider>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PROMPTED_KEY = "referral_invite_prompted";

// ─── Referral Invite Modal ────────────────────────────────────────────────────

export function ReferralInviteModal({ initial }: { initial: boolean }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = localStorage.getItem(PROMPTED_KEY);
    if (!seen) setOpen(true);
  }, []);

  async function handle(enabled: boolean) {
    setLoading(true);
    await setReferralInvites(enabled);
    localStorage.setItem(PROMPTED_KEY, "1");
    setLoading(false);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && setOpen(v)}>
      <DialogContent
        className="max-w-md rounded-3xl border bg-background p-0 overflow-hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <div className="p-6">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Settings2 className="h-7 w-7 text-primary" />
          </div>

          <DialogHeader className="space-y-3 text-center">
            <DialogTitle
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
            >
              Let referrals find you
            </DialogTitle>

            <DialogDescription className="text-sm leading-6">
              Instead of sharing your referral code yourself, users can send
              <span className="font-medium text-foreground">
                {" "}
                you referral requests
              </span>
              . Review each request and choose whether to accept it.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-3 rounded-2xl border bg-muted/30 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              <p className="text-sm">
                You stay in control : accept or decline every request.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Gift className="h-4 w-4 text-primary shrink-0" />
              <p className="text-sm">
                Earn the same{" "}
                <span className="font-semibold">CA$5</span> reward for every
                successful referral.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Repeat2 className="h-4 w-4 text-primary shrink-0" />
              <p className="text-sm">
                Turn this on or off anytime from the settings icon.
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              disabled={loading}
              onClick={() => handle(false)}
              className="flex-1 h-11"
            >
              Maybe later
            </Button>

            <Button
              disabled={loading}
              onClick={() => handle(true)}
              className="flex-1 h-11"
            >
              {loading ? "Enabling..." : "Enable Invites"}
            </Button>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            You can change this anytime in Referral Settings.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Referral Settings Toggle ─────────────────────────────────────────────────

export function ReferralSettingsToggle({ initial }: { initial: boolean }) {
  const [enabled, setEnabled] = useState(initial);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const next = !enabled;
    await setReferralInvites(next);
    setEnabled(next);
    setLoading(false);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-xl border-border hover:border-primary/40 hover:bg-muted/40"
          aria-label="Referral settings"
        >
          <Settings size={15} className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-64 p-0 rounded-2xl border-border/60 shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-border/60">
          <p
            className="text-xs font-black text-foreground"
            style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
          >
            Referral Settings
          </p>
        </div>

        {/* Toggle row */}
        <div className="px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground mb-0.5">
                Receive Invite Requests
              </p>
              <p className="text-[10px] leading-relaxed text-muted-foreground">
                Let other users send you referral requests instead of sharing
                your code manually.
              </p>
            </div>

            <Switch
              checked={enabled}
              onCheckedChange={toggle}
              disabled={loading}
              aria-label="Toggle referral invite requests"
              className="shrink-0 mt-0.5"
            />
          </div>

          {/* Status label */}
          <p
            className="mt-3 text-[10px] font-semibold"
            style={{
              color: enabled
                ? "oklch(0.5271 0.1699 149.2138)"
                : "hsl(var(--muted-foreground))",
            }}
          >
            {loading ? "Saving…" : enabled ? "● Active" : "○ Off"}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function ReferralPageClient({
  referralData,
  userData,
}: ReferralPageClientProps) {
  const earnedDisplay = (referralData.totalEarned / 100).toFixed(2);

  return (
    <div className="min-h-screen w-full bg-background">
      <ReferralInviteModal initial={userData.recieveReferralInvites} />
      <div
        className="relative mx-auto w-full px-4 pb-16 pt-8 sm:px-6 sm:pt-12"
        style={{ maxWidth: "520px" }}
      >
        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1
              className="font-black leading-tight mb-2 text-foreground"
              style={{
                fontFamily: "'Sora', system-ui, sans-serif",
                fontSize: "clamp(28px, 7vw, 38px)",
                letterSpacing: "-0.03em",
              }}
            >
              Refer &amp; Earn
            </h1>
            <div className="shrink-0 flex items-center justify-end mb-2">
              <ReferralSettingsToggle
                initial={userData.recieveReferralInvites}
              />
            </div>
          </div>
          <p
            className="text-sm leading-relaxed text-muted-foreground"
            style={{ maxWidth: "380px" }}
          >
            Earn CA$5 in gift credit for every friend who joins and places their
            first order over CA$21.
          </p>
        </div>

        <div className="mb-3">
          <EarningsHero
            earned={earnedDisplay}
            uses={referralData.uses}
            code={referralData.code}
            maxUses={referralData.maxUses}
          />
        </div>

        <div className="mb-3">
          <HowItWorks />
        </div>

        <div className="mb-3">
          <UsageStats
            uses={referralData.uses}
            maxUses={referralData.maxUses}
            expiresAt={referralData.expiresAt}
          />
        </div>

        <div className="rounded-2xl bg-card border border-border/60 px-5 py-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              People who used your code
            </p>
            {referralData.usedBy.length > 0 && (
              <span
                className="text-xs font-black px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
              >
                {referralData.usedBy.length}
              </span>
            )}
          </div>
          <UsedByList
            usedBy={referralData.usedBy}
            maxUses={referralData.maxUses}
          />
        </div>
      </div>
    </div>
  );
}