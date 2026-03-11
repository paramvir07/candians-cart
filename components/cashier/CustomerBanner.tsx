"use client";

import { ShoppingCart, Wallet, Gift } from "lucide-react";
import { Customer } from "@/types/customer/customer";
import { fmtShort } from "@/lib/fomatPrice";
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
  const initials = customer.name
    ? customer.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "C";

  return (
    <div className="w-[95%] md:w-[70%] border-b border-border/50 bg-card/95 backdrop-blur-md sticky top-0 z-40 shadow-lg rounded-lg">
      <div className="flex items-center gap-2 px-3 py-2">
        <Link
          href={`/cashier/customer/${customerId}`}
          aria-label="Customer"
        >
          <div className="relative shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow ring-2 ring-primary/25">
            {initials}
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background" />
          </div>
        </Link>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight text-foreground">
            {customer.name}
          </p>
          <p className="text-[10px] font-mono text-muted-foreground leading-tight">
            #{customerId.slice(-6).toUpperCase()}
          </p>
        </div>

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
      </div>
    </div>
  );
}

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
