"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Sparkles,
  Clock,
  CheckCircle2,
  Banknote,
  CreditCard,
  Wallet,
  X,
  ChevronRight,
  Package,
} from "lucide-react";
import { CategoryIllustration } from "@/components/customer/shared/CategoryIllustration";
import OrderDetail from "./OrderDetail";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

const fmt = (cents: number) => `CA$${(cents / 100).toFixed(2)}`;

function StatusBadge({ status }: { status?: string }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 tracking-wide uppercase">
        <CheckCircle2 className="w-2.5 h-2.5" />
        Completed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200 tracking-wide uppercase">
      <Clock className="w-2.5 h-2.5" />
      Pending
    </span>
  );
}

function PaymentBadge({ mode }: { mode?: string }) {
  const map: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    wallet: {
      label: "Wallet",
      className: "bg-violet-50 text-violet-700 border-violet-200",
      icon: <Wallet className="w-2.5 h-2.5" />,
    },
    cash: {
      label: "Cash",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: <Banknote className="w-2.5 h-2.5" />,
    },
    card: {
      label: "Card",
      className: "bg-blue-50 text-blue-700 border-blue-200",
      icon: <CreditCard className="w-2.5 h-2.5" />,
    },
    pending: {
      label: "Not paid",
      className: "bg-stone-100 text-stone-500 border-stone-200 whitespace-nowrap",
      icon: <Clock className="w-2.5 h-2.5" />,
    },
  };

  const m = map[mode ?? ""] ?? {
    label: mode ?? "—",
    className: "bg-stone-50 text-stone-500 border-stone-200",
    icon: null,
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border tracking-wide uppercase ${m.className}`}>
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

export default function OrderCard({ order, customerId, allOrders }: OrderCardProps) {
  const [open, setOpen] = useState(false);

  const orderId = order._id.toString().slice(-7).toUpperCase();
  const date = new Date(order.createdAt).toLocaleDateString("en-CA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const thumbUrl = order.products?.[0]?.productId?.images?.[0]?.url;
  const firstCat = order.products?.[0]?.productId?.category ?? "Other";

  const subsidyUsed = order.subsidyUsed ?? 0;
  const subsidyGenerated = order.subsidy ?? 0;
  const hasSubsidyUsed = subsidyUsed > 0;
  const hasSubsidyGenerated = subsidyGenerated > 0;

  const totalItems = (order.products?.length ?? 0) + (order.subsidyItems?.length ?? 0);
  const isCompleted = order.status === "completed";
  const isPendingPayment = order.paymentMode === "pending";

  const accentColor = isCompleted ? "#10b981" : "#f59e0b";
  const accentGradient = isCompleted
    ? "linear-gradient(to bottom, #10b981, #059669)"
    : "linear-gradient(to bottom, #f59e0b, #d97706)";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="w-full text-left group focus:outline-none">
          <div
            className="relative overflow-hidden rounded-2xl border bg-white"
            style={{
              borderColor: isCompleted ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.25)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
              transition: "box-shadow 0.18s ease, transform 0.18s ease",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.boxShadow = "0 4px 12px rgba(0,0,0,0.07), 0 12px 32px rgba(0,0,0,0.07)";
              el.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)";
              el.style.transform = "translateY(0)";
            }}
          >
            {/* Left accent bar */}
            <div
              className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
              style={{ background: accentGradient }}
            />

            {/* ══════════════════════════════════
                MOBILE  (hidden on lg+)
            ══════════════════════════════════ */}
            <div className="lg:hidden pl-4 pr-4 py-3.5 flex items-center gap-3">
              {/* Thumbnail */}
              <div
                className="relative shrink-0 rounded-xl overflow-hidden"
                style={{ width: 52, height: 52, border: "1.5px solid rgba(0,0,0,0.07)", background: "#f8f8f6" }}
              >
                {thumbUrl ? (
                  <Image src={thumbUrl} alt="Order" fill className="object-cover" />
                ) : (
                  <CategoryIllustration category={firstCat} />
                )}
                {(hasSubsidyUsed || hasSubsidyGenerated) && (
                  <div className="absolute bottom-0 right-0 p-0.5 rounded-tl-lg" style={{ background: "#f59e0b" }}>
                    <Sparkles className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Row 1: ID + total */}
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono font-bold text-[13px] text-stone-800 tracking-wider">
                    #{orderId}
                  </p>
                  <p className="font-bold text-[15px] tabular-nums" style={{ color: "#16a34a" }}>
                    {fmt(order.cartTotal)}
                  </p>
                </div>

                {/* Row 2: date + item count */}
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className="text-[11px] text-stone-400 font-medium">{date}</p>
                  <p className="text-[11px] text-stone-400 font-medium">
                    {totalItems} item{totalItems !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Row 3: badges — clearly labelled to avoid "PENDING PENDING" confusion */}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {/* Order status */}
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                      Order
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                  {/* Payment */}
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                      Pay
                    </span>
                    <PaymentBadge mode={order.paymentMode} />
                  </div>
                </div>
              </div>
            </div>

{/* ══════════════════════════════════
    DESKTOP  (hidden below lg)
══════════════════════════════════ */}
<div className="hidden lg:flex items-center gap-3 pl-5 pr-4 py-4">
  {/* Thumbnail */}
  <div
    className="relative shrink-0 rounded-xl overflow-hidden"
    style={{ width: 54, height: 54, border: "1.5px solid rgba(0,0,0,0.07)", background: "#f8f8f6", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}
  >
    {thumbUrl ? (
      <Image src={thumbUrl} alt="Order" fill className="object-cover" />
    ) : (
      <CategoryIllustration category={firstCat} />
    )}
    {(hasSubsidyUsed || hasSubsidyGenerated) && (
      <div className="absolute bottom-0 right-0 p-0.5 rounded-tl-lg" style={{ background: "#f59e0b" }}>
        <Sparkles className="w-2.5 h-2.5 text-white" />
      </div>
    )}
  </div>

  {/* Data columns — grid so columns never overflow */}
  <div className="flex-1 grid grid-cols-[1.4fr_1.3fr_0.5fr_1fr_1.1fr_1fr] items-center gap-x-2 min-w-0">
    {/* Order # */}
    <div className="min-w-0">
      <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Order</p>
      <p className="font-mono font-bold text-[13px] text-stone-800 tracking-wider truncate">#{orderId}</p>
    </div>

    {/* Date */}
    <div className="min-w-0">
      <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Date</p>
      <p className="text-[13px] font-semibold text-stone-600 truncate">{date}</p>
    </div>

    {/* Items */}
    <div className="min-w-0">
      <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Items</p>
      <div className="flex items-center gap-1">
        <Package className="w-3 h-3 text-stone-400 shrink-0" />
        <p className="text-[13px] font-bold text-stone-700">{totalItems}</p>
      </div>
    </div>

    {/* Payment */}
    <div className="min-w-0 overflow-hidden">
      <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">Payment</p>
      <PaymentBadge mode={order.paymentMode} />
    </div>

    {/* Status */}
    <div className="min-w-0 overflow-hidden">
      <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">Status</p>
      <StatusBadge status={order.status} />
    </div>

    {/* Total */}
    <div className="min-w-0 text-right">
      <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Total</p>
      <p className="tabular-nums font-bold text-[15px] text-green-700 truncate">{fmt(order.cartTotal)}</p>
    </div>
  </div>
</div>
          </div>
        </button>
      </DialogTrigger>

      {/* Dialog */}
      <DialogContent className="w-[95vw] max-w-[760px] p-0 gap-0 overflow-hidden rounded-2xl">
        <DialogClose asChild>
          <button className="absolute right-3 top-3 z-50 rounded-full p-1.5 bg-background/80 backdrop-blur border border-border hover:bg-muted transition">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </DialogClose>
        <OrderDetail order={order} customerId={customerId} allOrders={allOrders} />
      </DialogContent>
    </Dialog>
  );
}