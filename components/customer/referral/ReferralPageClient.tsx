"use client";

import { useEffect, useState } from "react";
import logoIcon from "@/app/icon.jpg";
import {
  Copy,
  Check,
  Share2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  DollarSign,
  Settings,
  Settings2,
  CheckCircle2,
  Gift,
  Repeat2,
  Users,
  QrCode,
  X,
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
import Link from "next/link";
import { getReferralShareMessage, getReferralUrl } from "@/lib/shareMessage";
import { QRCodeSVG } from "qrcode.react";

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
  perReferAmount: number;
  placedFirstOrder: boolean;
  referralCodeEnabled: boolean;
  myreferralCodeId?: string | null;
  recieveReferralInvites: boolean;
}

interface ReferralPageClientProps {
  referralData: ReferralDocument;
  userData: UserDataProps;
  ReqCount: number;
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
  usedBy: ReferralUsedBy[],
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

// ─── Share apps config ────────────────────────────────────────────────────────

interface AppConfig {
  label: string;
  bg: string;
  icon: React.ReactNode;
  href: (url: string, message: string) => string;
}

const SHARE_APPS: AppConfig[] = [
  {
    label: "WhatsApp",
    bg: "#25D366",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.561 4.14 1.535 5.877L.057 23.887l6.197-1.455A11.937 11.937 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.937 0-3.748-.5-5.325-1.373l-.38-.224-3.938.924.966-3.834-.245-.396A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
      </svg>
    ),
    href: (_url, message) =>
      `https://wa.me/?text=${encodeURIComponent(message)}`,
  },
  {
    label: "X",
    bg: "#000000",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    href: (_url, message) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
  },
  {
    label: "Email",
    bg: "#007AFF",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
      >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    href: (_url, message) =>
      `mailto:?subject=${encodeURIComponent(
        "Join Candian's Cart",
      )}&body=${encodeURIComponent(message)}`,
  },
  {
    label: "Messages",
    bg: "#34C759",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    href: (_url, message) => `sms:?body=${encodeURIComponent(message)}`,
  },
];

// ─── Share Sheet Dialog ───────────────────────────────────────────────────────
// Shown only on desktop as fallback when navigator.share is unavailable

function ShareSheetDialog({
  open,
  onClose,
  code,
}: {
  open: boolean;
  onClose: () => void;
  code: string;
}) {
  const url = getReferralUrl(code);
  const shareMessage = getReferralShareMessage(code);
  const [urlCopied, setUrlCopied] = useState(false);

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-full max-w-sm rounded-2xl border border-border bg-background p-0 overflow-hidden gap-0">
        <DialogHeader className="flex flex-row items-center justify-between px-5 pt-5 pb-3 space-y-0">
          <button
            onClick={onClose}
            className="-ml-1 p-1 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <DialogTitle className="text-sm font-semibold text-foreground">
            Share via
          </DialogTitle>
          <div className="w-7" />
        </DialogHeader>

        <div className="px-5 pb-8 flex flex-col gap-5">
          <div className="flex justify-around">
            {SHARE_APPS.map((app) => (
              <a
                key={app.label}
                href={app.href(url, shareMessage)}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col items-center gap-1.5"
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-110 active:scale-95"
                  style={{ background: app.bg }}
                >
                  {app.icon}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {app.label}
                </span>
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2">
            <span className="flex-1 truncate font-mono text-xs text-muted-foreground">
              {url}
            </span>
            <Button
              size="sm"
              variant={urlCopied ? "outline" : "default"}
              className={
                urlCopied
                  ? "shrink-0 rounded-lg border-primary/40 text-xs text-primary hover:bg-transparent"
                  : "shrink-0 rounded-lg text-xs"
              }
              onClick={copyUrl}
            >
              {urlCopied ? (
                <span className="flex items-center gap-1">
                  <Check size={11} /> Copied
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Copy size={11} /> Copy
                </span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── QR Dialog ────────────────────────────────────────────────────────────────

function QRDialog({
  open,
  onClose,
  code,
}: {
  open: boolean;
  onClose: () => void;
  code: string;
}) {
  const url = getReferralUrl(code);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="
          w-[92vw] max-w-sm
          rounded-[1.75rem]
          border border-primary/20
          bg-card
          p-0
          overflow-hidden
          shadow-2xl
        "
      >
        <div className="relative px-5 pt-5 pb-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="mb-5 pr-8 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
              <QrCode className="h-5 w-5 text-primary" />
            </div>

            <DialogHeader className="space-y-1">
              <DialogTitle
                className="text-lg font-black tracking-tight text-foreground"
                style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
              >
                Scan to join
              </DialogTitle>
            </DialogHeader>

            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Scan this QR code to join with your friend’s referral. After your
              first eligible order, your friend will receive their reward.
            </p>
          </div>

          {/* QR Card */}
          <div className="mx-auto flex w-fit flex-col items-center">
            <div className="rounded-[1.5rem] border border-primary/20 bg-card p-3 shadow-sm">
              <div className="rounded-2xl bg-white p-3">
                <QRCodeSVG
                  value={url}
                  size={220}
                  fgColor="#07553f"
                  bgColor="#ffffff"
                  level="H"
                  marginSize={0}
                  imageSettings={{
                    src: logoIcon.src,
                    height: 44,
                    width: 44,
                    excavate: true,
                  }}
                />
              </div>
            </div>

            <div className="mt-4 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
              <p className="font-mono text-xs font-bold tracking-wider text-primary">
                {code}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Earnings Hero ────────────────────────────────────────────────────────────

function EarningsHero({
  earned,
  uses,
  code,
  maxUses,
  perReferAmount,
}: {
  earned: string;
  uses: number;
  maxUses: number;
  code: string;
  perReferAmount: number;
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
              CA${perReferAmount}
            </p>
          </div>
          <div className="rounded-xl bg-white/10 border border-white/10 px-3 py-2.5">
            <p className="text-[10px] text-white/50 mb-1">Referred</p>
            <p
              className="text-base font-bold text-white"
              style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
            >
              {uses}/{maxUses}
            </p>
          </div>
          <div className="rounded-xl bg-white/10 border border-white/10 px-3 py-2.5">
            <p className="text-[10px] text-white/50 mb-1">Left to earn</p>
            <p
              className="text-base font-bold text-white"
              style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
            >
              CA${maxUses - uses > 0 ? (maxUses - uses) * perReferAmount : 0}
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

// ─── Share Row ────────────────────────────────────────────────────────────────

function ShareRow({ code }: { code: string }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const url = getReferralUrl(code);
  const shareMessage = getReferralShareMessage(code);

  async function handleShare() {
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    ) {
      try {
        await navigator.share({
          title: "Candian's Cart",
          text: shareMessage,
          url,
        });
        return;
      } catch {
        // user cancelled or native share failed — fall through
      }
    }
    setSheetOpen(true);
  }

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={handleShare}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-xs font-semibold text-muted-foreground bg-background transition-all active:scale-95 hover:bg-primary/5 hover:border-primary/40 hover:text-primary"
        >
          <Share2 size={13} />
          Share
        </button>

        <button
          onClick={() => setQrOpen(true)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-xs font-semibold text-muted-foreground bg-background transition-all active:scale-95 hover:bg-primary/5 hover:border-primary/40 hover:text-primary"
        >
          <QrCode size={13} />
          QR Code
        </button>
      </div>

      <ShareSheetDialog
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        code={code}
      />

      <QRDialog open={qrOpen} onClose={() => setQrOpen(false)} code={code} />
    </>
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

function GhostRow({
  style,
  ReferAmount,
}: {
  style?: React.CSSProperties;
  ReferAmount: number;
}) {
  return (
    <div className="flex items-center gap-3 py-3 px-2 -mx-2" style={style}>
      <div className="h-10 w-10 shrink-0 rounded-full bg-muted/60 border-2 border-dashed border-border/60" />
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="h-3 w-24 rounded-full bg-muted/60" />
        <div className="h-2.5 w-16 rounded-full bg-muted/40" />
      </div>
      <span className="shrink-0 text-xs font-semibold text-muted-foreground/40 border border-dashed border-border/40 px-2 py-1 rounded-full">
        CA${ReferAmount}
      </span>
    </div>
  );
}

// ─── Used-by list ─────────────────────────────────────────────────────────────

function UsedByList({
  usedBy,
  maxUses,
  perReferAmount,
}: {
  usedBy: ReferralUsedBy[];
  maxUses: number;
  perReferAmount: number;
}) {
  const months = groupByMonth(usedBy);
  const [page, setPage] = useState(0);

  const remainingSlots = Math.max(0, maxUses - usedBy.length);
  const currentMonthLabel = new Date().toLocaleDateString("en-CA", {
    month: "long",
    year: "numeric",
  });

  if (usedBy.length === 0) {
    return (
      <div>
        {Array.from({ length: Math.min(remainingSlots, 5) }).map((_, i) => (
          <GhostRow
            ReferAmount={perReferAmount}
            key={i}
            style={{
              borderTop:
                i > 0 ? "1px solid hsl(var(--border) / 0.5)" : undefined,
            }}
          />
        ))}
        {remainingSlots > 5 && (
          <p className="text-[10px] text-center text-muted-foreground/50 pt-3">
            +{remainingSlots - 5} more open spots · CA$
            {remainingSlots * perReferAmount} left to earn
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
                  · CA${ghostsForMonth * perReferAmount} left
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

        <div className="flex flex-col">
          {current.items.map((u, i) => (
            <div
              key={u._id}
              className="flex items-center gap-3 py-3 px-2 -mx-2 rounded-xl transition-colors hover:bg-muted/40"
              style={{
                borderTop:
                  i > 0 ? "1px solid hsl(var(--border) / 0.5)" : undefined,
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
                  CA${perReferAmount}
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

          {ghostsForMonth > 0 &&
            Array.from({ length: ghostsForMonth }).map((_, i) => (
              <GhostRow
                ReferAmount={perReferAmount}
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

export function ReferralInviteModal({
  initial,
  perReferAmount,
}: {
  initial: boolean;
  perReferAmount: number;
}) {
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
    setTimeout(() => setOpen(false), 0);
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
          </DialogHeader>

          <p className="text-sm leading-6 text-muted-foreground text-center mt-2">
            Instead of sharing your referral code yourself, users can send
            <span className="font-medium text-foreground">
              {" "}
              you referral requests
            </span>
            . Review each request and choose whether to accept it.
          </p>

          <div className="mt-6 space-y-3 rounded-2xl border bg-muted/30 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              <p className="text-sm">
                You stay in control — accept or decline every request.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Gift className="h-4 w-4 text-primary shrink-0" />
              <p className="text-sm">
                Earn the same{" "}
                <span className="font-semibold">CA${perReferAmount}</span>{" "}
                reward for every successful referral.
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
        <div className="px-4 py-3 border-b border-border/60">
          <p
            className="text-xs font-black text-foreground"
            style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
          >
            Referral Settings
          </p>
        </div>

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
  ReqCount,
}: ReferralPageClientProps) {
  const earnedDisplay = (referralData.totalEarned / 100).toFixed(2);

  return (
    <div className="min-h-screen w-full bg-background">
      <ReferralInviteModal
        initial={userData.recieveReferralInvites}
        perReferAmount={userData.perReferAmount}
      />
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
            <div className="shrink-0 flex items-center justify-end mb-2 gap-2 flex-row-reverse">
              <ReferralSettingsToggle
                initial={userData.recieveReferralInvites}
              />
              <Link
                href="/customer/referrals/requests"
                className="relative inline-flex"
              >
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-xl border-border hover:border-primary/40 hover:bg-muted/40"
                  aria-label="Referral requests"
                >
                  <Users size={15} className="text-muted-foreground" />
                </Button>
                {ReqCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                    {ReqCount > 9 ? "9+" : ReqCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
          <p
            className="text-sm leading-relaxed text-muted-foreground"
            style={{ maxWidth: "380px" }}
          >
            Earn CA${userData.perReferAmount} in gift credit for every friend
            who joins and places their first order over CA$21.
          </p>
        </div>

        <div className="mb-3">
          <EarningsHero
            earned={earnedDisplay}
            uses={referralData.uses}
            code={referralData.code}
            maxUses={referralData.maxUses}
            perReferAmount={userData.perReferAmount}
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
            perReferAmount={userData.perReferAmount}
          />
        </div>
      </div>
    </div>
  );
}
