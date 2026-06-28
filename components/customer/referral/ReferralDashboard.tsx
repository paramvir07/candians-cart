"use client";

import { useState, useTransition } from "react";
import { Check, X, Clock, Users, ChevronLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import {
  respondToReferralRequest,
  SerializedReferralRequest,
} from "@/actions/customer/ReferralRequest.Action";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return phone;
  return "•••• " + digits.slice(-4);
}

// ─── Single request card ──────────────────────────────────────────────────────

function RequestCard({
  req,
  onDismiss,
}: {
  req: SerializedReferralRequest;
  onDismiss: (id: string) => void;
}) {
  const [result, setResult] = useState<"accepted" | "declined" | null>(null);
  const [isPending, startTransition] = useTransition();

  function respond(accept: boolean) {
    startTransition(async () => {
      const res = await respondToReferralRequest(req._id, accept);
      if (res.success) {
        setResult(accept ? "accepted" : "declined");
        // After flash animation completes, tell parent to remove this item
        setTimeout(() => onDismiss(req._id), 900);
      }
    });
  }

  return (
    <div
      className="group relative flex items-center gap-4 rounded-2xl border border-border/60 bg-card px-4 py-4"
      style={{
        opacity: result ? 0 : 1,
        transform: result ? "scale(0.97)" : "scale(1)",
        transition: "opacity 0.35s ease, transform 0.35s ease",
      }}
    >
      {result && (
        <div
          className="absolute inset-0 rounded-2xl flex items-center justify-center"
          style={{
            background:
              result === "accepted"
                ? "oklch(0.6271 0.1699 149.2138 / 0.12)"
                : "hsl(var(--destructive) / 0.08)",
          }}
        >
          <div className="flex items-center gap-2">
            {result === "accepted" ? (
              <Check size={16} className="text-primary" />
            ) : (
              <X size={16} className="text-destructive" />
            )}
            <span
              className="text-sm font-bold"
              style={{
                fontFamily: "'Sora', system-ui, sans-serif",
                color:
                  result === "accepted"
                    ? "oklch(0.5271 0.1699 149.2138)"
                    : "hsl(var(--destructive))",
              }}
            >
              {result === "accepted" ? "Accepted" : "Declined"}
            </span>
          </div>
        </div>
      )}

      <Avatar className="h-11 w-11 shrink-0 ring-2 ring-primary/15 rounded-full">
        <AvatarImage
          src={`https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(req.name)}`}
          className="rounded-full"
        />
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold rounded-full">
          {req.name
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
          {req.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-muted-foreground font-mono">
            {maskPhone(req.phoneNumber)}
          </span>
          <span className="text-muted-foreground/40 text-xs">·</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock size={10} className="shrink-0" />
            {timeAgo(req.createdAt)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => respond(false)}
          disabled={isPending || !!result}
          aria-label="Decline request"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-all active:scale-95 disabled:opacity-40 hover:border-destructive/50 hover:text-destructive hover:bg-destructive/5"
        >
          <X size={14} />
        </button>
        <button
          onClick={() => respond(true)}
          disabled={isPending || !!result}
          aria-label="Accept request"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary transition-all active:scale-95 disabled:opacity-40 hover:bg-primary/20 hover:border-primary/50"
        >
          <Check size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyRequests() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <Users size={22} className="text-muted-foreground" />
      </div>
      <p
        className="text-base font-bold text-foreground mb-1"
        style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
      >
        No pending requests
      </p>
      <p className="text-sm text-muted-foreground max-w-xs">
        When someone sends you a referral request, it'll show up here. Make
        sure "Receive Invites" is on in your referral settings.
      </p>
      <Link
        href="/customer/referrals"
        className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
      >
        <ChevronLeft size={13} />
        Back to Refer &amp; Earn
      </Link>
    </div>
  );
}

// ─── Main client ──────────────────────────────────────────────────────────────

export function ReferralRequestsDashboard({
  requests,
}: {
  requests: SerializedReferralRequest[];
}) {
  const [list, setList] = useState(requests);

  function handleDismiss(id: string) {
    setList((prev) => prev.filter((r) => r._id !== id));
  }

  if (list.length === 0) return <EmptyRequests />;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Pending · {list.length}
        </p>
        <p className="text-[10px] text-muted-foreground">
          Accepting adds them as your referral
        </p>
      </div>

      {list.map((req) => (
        <RequestCard key={req._id} req={req} onDismiss={handleDismiss} />
      ))}
    </div>
  );
}