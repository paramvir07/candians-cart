"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  Clock,
  CheckCircle2,
  Banknote,
  CreditCard,
  Wallet,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryIllustration } from "@/components/customer/shared/CategoryIllustration";
import OrderDetail from "./OrderDetail";


const fmt = (cents: number) => `CA$${(cents / 100).toFixed(2)}`;

function StatusBadge({ status }: { status?: string }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-700 border border-green-200">
        <CheckCircle2 className="w-3 h-3" />
        Completed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 border border-amber-200">
      <Clock className="w-3 h-3" />
      Pending
    </span>
  );
}

function PaymentBadge({ mode }: { mode?: string }) {
  const map: Record<
    string,
    { label: string; className: string; icon: React.ReactNode }
  > = {
    wallet: {
      label: "Wallet",
      className: "bg-violet-100 text-violet-700 border-violet-200",
      icon: <Wallet className="w-3 h-3" />,
    },
    cash: {
      label: "Cash",
      className: "bg-emerald-100 text-emerald-700 border-emerald-200",
      icon: <Banknote className="w-3 h-3" />,
    },
    card: {
      label: "Card",
      className: "bg-blue-100 text-blue-700 border-blue-200",
      icon: <CreditCard className="w-3 h-3" />,
    },
    pending: {
      label: "Pending",
      className: "bg-amber-100 text-amber-700 border-amber-200",
      icon: <Clock className="w-3 h-3" />,
    },
  };
  const m = map[mode ?? ""] ?? {
    label: mode ?? "—",
    className: "bg-gray-100 text-gray-600 border-gray-200",
    icon: null,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${m.className}`}
    >
      {m.icon}
      {m.label}
    </span>
  );
}

interface OrderCardProps {
  order: any;
  customerId?: string;
  allOrders?: boolean;
}

export default function OrderCard({
  order,
  customerId,
  allOrders,
}: OrderCardProps) {
  const [open, setOpen] = useState(false);

  const orderId = order._id.toString().slice(-7).toUpperCase();
  const date = new Date(order.createdAt).toLocaleDateString("en-CA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const thumbUrl = order.products?.[0]?.productId?.images?.[0]?.url;
  const firstCat = order.products?.[0]?.productId?.category ?? "Other";
  const hasSubsidy = (order.susbsidyUsed ?? 0) > 0;

  return (
    <Card className="overflow-hidden border-border shadow-sm">
      {/* Clickable summary row */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left hover:bg-muted/40 transition-colors"
      >
        <CardContent className="p-0">
          <div className="flex items-center gap-3 px-4 sm:px-5 py-4">
            {/* Thumbnail */}
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-muted shrink-0 ring-2 ring-primary/10 border border-border">
              {thumbUrl ? (
                <Image
                  src={thumbUrl}
                  alt="Order"
                  fill
                  className="object-cover"
                />
              ) : (
                <CategoryIllustration category={firstCat} />
              )}
              {hasSubsidy && (
                <div className="absolute bottom-0 right-0 bg-amber-400 rounded-tl-md p-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>

            {/* Meta */}
            <div className="flex-1 min-w-0">
              {/* Mobile */}
              <div className="flex items-start justify-between sm:hidden">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Order #{orderId}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <StatusBadge status={order.status} />
                    <PaymentBadge mode={order.paymentMode} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{date}</p>
                </div>
                <div className="text-right ml-2 shrink-0">
                  <p className="text-base font-bold text-primary tabular-nums">
                    {fmt(order.cartTotal)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.products.length} item
                    {order.products.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Desktop */}
              <div className="hidden sm:flex items-center gap-6 xl:gap-8 w-full">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Order
                  </p>
                  <p className="text-sm font-bold font-mono">#{orderId}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Date
                  </p>
                  <p className="text-sm font-semibold">{date}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Items
                  </p>
                  <p className="text-sm font-semibold">
                    {order.products.length}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Payment
                  </p>
                  <PaymentBadge mode={order.paymentMode} />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Status
                  </p>
                  <StatusBadge status={order.status} />
                </div>
                {hasSubsidy && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Subsidy
                    </p>
                    <span className="text-xs font-bold text-amber-600">
                      -{fmt(order.susbsidyUsed)}
                    </span>
                  </div>
                )}
                <div className="ml-auto">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Total
                  </p>
                  <p className="text-base font-bold text-primary tabular-nums">
                    {fmt(order.cartTotal)}
                  </p>
                </div>
              </div>
            </div>

            {/* Chevron */}
            <div className="shrink-0 ml-1 text-muted-foreground">
              {open ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>
        </CardContent>
      </button>

      {/* Expanded detail — passes all needed props cleanly */}
      {open && (
        <OrderDetail
          order={order}
          customerId={customerId}
          allOrders={allOrders}
        />
      )}
    </Card>
  );
}
