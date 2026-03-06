"use client";

import {
  ShoppingCart,
  MapPin,
  Phone,
  Mail,
  Wallet,
  Gift,
  ChevronDown,
  ChevronUp,
  BadgeDollarSign,
} from "lucide-react";
import { Customer } from "@/types/customer/customer";
import { useState } from "react";
import { fmt, fmtShort } from "@/lib/fomatPrice";
import Link from "next/link";

type CustomerBannerProps = {
  customer: Customer;
  customerId: string;
  cartCount: number;
};

export function CustomerBanner({
  customer,
  customerId,
  cartCount,
}: CustomerBannerProps) {
  const [expanded, setExpanded] = useState(false);

  const initials = customer.name
    ? customer.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

  const location = [customer.city, customer.province]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="w-[95%] md:w-[70%] border-b border-border/50 bg-card/95 backdrop-blur-md sticky top-0 z-40 shadow-lg rounded-lg">
      {/* ── Always-visible main row ── */}
      <div className="flex items-center gap-2 px-3 py-2">
        {/* Avatar */}
        <Link href={`/cashier/customer/${customerId}`} aria-label="Cashier Profile">
          <div className="relative shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow ring-2 ring-primary/25">
            {initials}
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background" />
          </div>
        </Link>

        {/* Name + ID — shrinks gracefully */}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight text-foreground ">
            {customer.name}
          </p>
          <p className="text-[10px] font-mono text-muted-foreground leading-tight">
            #{customerId.slice(-6).toUpperCase()}
          </p>
        </div>

        {/* Compact badge strip — icon only on tiny screens */}
        <div className="flex shrink-0 items-center gap-1">
          <CompactBadge
            icon={Wallet}
            value={fmtShort(customer.walletBalance)}
            highlight
            title="Wallet Balance"
          />
          <CompactBadge
            icon={Gift}
            value={fmtShort(customer.giftWalletBalance)}
            title="Gift Wallet"
          />
          <CompactBadge
            icon={ShoppingCart}
            value={String(cartCount)}
            dot={cartCount > 0}
            title="Cart Items"
          />
        </div>

        {/* Expand toggle — always shown */}
        <button
          onClick={() => setExpanded((p) => !p)}
          className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg border border-border/50 bg-muted/50 text-muted-foreground transition-all hover:bg-muted active:scale-95"
          aria-label={expanded ? "Hide details" : "Show details"}
        >
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* ── Expandable detail panel — all screen sizes ── */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-border/40 bg-muted/20 px-3 py-3 space-y-3">
          {/* Contact row */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {customer.mobile && (
              <DetailTile icon={Phone} label="Mobile" value={customer.mobile} />
            )}
            {customer.email && (
              <DetailTile
                icon={Mail}
                label="Email"
                value={customer.email}
                className="col-span-2 sm:col-span-1"
              />
            )}
            {location && (
              <DetailTile icon={MapPin} label="Location" value={location} />
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-border/40" />

          {/* Financials row */}
          <div className="grid grid-cols-3 gap-2">
            <FinanceTile
              icon={Wallet}
              label="Wallet"
              value={fmt(customer.walletBalance)}
              highlight
            />
            <FinanceTile
              icon={Gift}
              label="Gift Wallet"
              value={fmt(customer.giftWalletBalance)}
            />
            <FinanceTile
              icon={BadgeDollarSign}
              label="Budget / mo"
              value={fmt(customer.monthlyBudget)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── format helpers (values stored in cents) ──────────────────────────────



// ─── sub-components ────────────────────────────────────────────────────────

function CompactBadge({
  icon: Icon,
  value,
  highlight,
  dot,
  title,
}: {
  icon: React.ElementType;
  value: string;
  highlight?: boolean;
  dot?: boolean;
  title?: string;
}) {
  return (
    <div
      title={title}
      className={`relative flex items-center gap-1 rounded-lg border px-1.5 py-1 text-xs font-semibold transition-colors
        ${
          highlight
            ? "bg-primary/10 text-primary border-primary/20"
            : "bg-muted/60 text-muted-foreground border-border/40"
        }`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span className="leading-none">{value}</span>
      {dot && (
        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary ring-1 ring-background" />
      )}
    </div>
  );
}

function DetailTile({
  icon: Icon,
  label,
  value,
  className = "",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-xl border border-border/40 bg-background/70 px-3 py-2 ${className}`}
    >
      <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className="truncate text-xs font-semibold text-foreground leading-snug">
        {value}
      </p>
    </div>
  );
}

function FinanceTile({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-center transition-colors
        ${
          highlight
            ? "border-primary/25 bg-primary/8 text-primary"
            : "border-border/40 bg-background/70 text-muted-foreground"
        }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span
        className={`text-xs font-bold leading-tight ${
          highlight ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </span>
      <span className="text-[10px] leading-none opacity-70">{label}</span>
    </div>
  );
}
