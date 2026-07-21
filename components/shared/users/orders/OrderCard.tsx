"use client";

import { useState } from "react";
import Image from "next/image";
import { Sparkles, Wallet, X, Package } from "lucide-react";
import { CategoryIllustration } from "@/components/customer/shared/CategoryIllustration";
import OrderDetail from "./OrderDetail";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatVancouverDate, formatVancouverTime } from "@/lib/timezone";

const fmt = (cents: number) => `CA$${(cents / 100).toFixed(2)}`;
const fmtBefore = (cents: number) => `$${(cents / 100).toFixed(2)}`;

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
  const date = formatVancouverDate(order.createdAt);
  const time = formatVancouverTime(order.createdAt);

  const thumbUrl = order.products?.[0]?.productId?.images?.[0]?.url;
  const firstCat = order.products?.[0]?.productId?.category ?? "Other";

  const subsidyUsed = order.subsidyUsed ?? 0;
  const subsidyGenerated = order.subsidy ?? 0;
  const hasSubsidyUsed = subsidyUsed > 0;
  const hasSubsidyGenerated = subsidyGenerated > 0;
  const savedToWallet = Math.max(subsidyGenerated - subsidyUsed, 0);
  const hasSavedToWallet = savedToWallet > 0;
  const hasSavingsInfo = hasSubsidyUsed || hasSavedToWallet;
  const originalTotal = (order.cartTotal ?? 0) + subsidyUsed;

  // ✅ miscItems included in count
  const totalItems =
    (order.products?.length ?? 0) +
    (order.subsidyItems?.length ?? 0) +
    (order.miscItems?.length ?? 0);

  const isCompleted = order.status === "completed";
  const accentGradient = isCompleted
    ? "linear-gradient(to bottom, #10b981, #059669)"
    : "linear-gradient(to bottom, #f59e0b, #d97706)";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="w-full text-left group focus:outline-none"
        >
          <div
            className="relative overflow-hidden rounded-2xl border bg-white"
            style={{
              borderColor: isCompleted
                ? "rgba(16,185,129,0.2)"
                : "rgba(245,158,11,0.25)",
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
              transition: "box-shadow 0.18s ease, transform 0.18s ease",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.boxShadow =
                "0 4px 12px rgba(0,0,0,0.07), 0 12px 32px rgba(0,0,0,0.07)";
              el.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.boxShadow =
                "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)";
              el.style.transform = "translateY(0)";
            }}
          >
            {/* Left accent bar */}
            <div
              className="absolute left-0 top-0 bottom-0 w-0.75 rounded-l-2xl"
              style={{ background: accentGradient }}
            />

            {/* ══════════════════════════════════
                MOBILE  (hidden on lg+)
            ══════════════════════════════════ */}
            <div className="lg:hidden px-4 py-3">
              <div className="flex items-center gap-3">
                {/* Thumbnail */}
                <div
                  className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-50"
                  style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
                >
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
                  {(hasSubsidyUsed || hasSubsidyGenerated) && (
                    <div className="absolute bottom-0 right-0 rounded-tl-lg bg-amber-500 p-0.5">
                      <Sparkles className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </div>

                {/* Main information */}
                <div className="min-w-0 flex-1">
                  {/* Order number, item count, and total */}
                  <div className="grid grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-2">
                    <p className="whitespace-nowrap font-mono text-[13px] font-bold tracking-wider text-stone-800">
                      #{orderId}
                    </p>

                    <span
                      className="inline-flex items-center justify-center gap-1 whitespace-nowrap text-[10px] font-semibold text-stone-500"
                      aria-label={`${totalItems} item${totalItems !== 1 ? "s" : ""}`}
                    >
                      <Package className="h-3 w-3 shrink-0 text-stone-400" />
                      {totalItems}
                    </span>

                    <div className="flex min-w-0 items-baseline justify-end gap-1.5 text-right tabular-nums">
                      {hasSubsidyUsed && (
                        <span className="shrink-0 text-[10px] font-medium leading-none text-stone-400 line-through decoration-1 decoration-current/70">
                          {fmtBefore(originalTotal)}
                        </span>
                      )}
                      <span className="shrink-0 text-[17px] font-bold leading-none text-green-700">
                        {fmt(order.cartTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Date/time on the left, savings summary on the right. */}
                  <div className="mt-1.5 flex min-h-[34px] items-start justify-between gap-3">
                    <div className="min-w-0 text-[10px] font-medium leading-[1.35] text-stone-400">
                      <p className="truncate">{date}</p>
                      <p className="truncate text-stone-400/80">{time}</p>
                    </div>

                    {hasSavingsInfo && (
                      <div className="min-w-0 shrink-0 space-y-0.5 text-right tabular-nums">
                        {hasSubsidyUsed && (
                          <div
                            className="flex items-center justify-end gap-1.5 whitespace-nowrap"
                            title={`Order savings: ${fmt(subsidyUsed)}`}
                          >
                            <span className="text-[9px] font-semibold text-stone-400">
                              Order savings
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700">
                              -{fmt(subsidyUsed)}
                            </span>
                          </div>
                        )}

                        {hasSavedToWallet && (
                          <div
                            className="flex items-center justify-end gap-1.5 whitespace-nowrap"
                            title={`Gift Wallet credit: ${fmt(savedToWallet)}`}
                          >
                            <span className="text-[9px] font-semibold text-stone-400">
                              Gift Wallet credit
                            </span>
                            <span className="text-[10px] font-bold text-violet-700">
                              +{fmt(savedToWallet)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
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
                style={{
                  width: 54,
                  height: 54,
                  border: "1.5px solid rgba(0,0,0,0.07)",
                  background: "#f8f8f6",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                }}
              >
                {thumbUrl ? (
                  <Image
                    src={thumbUrl}
                    alt="Order"
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                ) : (
                  <CategoryIllustration category={firstCat} />
                )}
                {(hasSubsidyUsed || hasSubsidyGenerated) && (
                  <div
                    className="absolute bottom-0 right-0 p-0.5 rounded-tl-lg"
                    style={{ background: "#f59e0b" }}
                  >
                    <Sparkles className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>

              {/* Data columns */}
              <div className="grid min-w-0 flex-1 grid-cols-[1.3fr_1.2fr_0.5fr_1.45fr_1.05fr] items-center gap-x-4">
                {/* Order # */}
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">
                    Order
                  </p>
                  <p className="font-mono font-bold text-[13px] text-stone-800 tracking-wider truncate">
                    #{orderId}
                  </p>
                </div>

                {/* Date */}
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">
                    Date
                  </p>
                  <p className="text-[13px] font-semibold text-stone-600 truncate">
                    {date}
                  </p>
                  <p className="text-[11px] font-medium text-stone-400 truncate">
                    {time}
                  </p>
                </div>

                {/* Items */}
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">
                    Items
                  </p>
                  <div className="flex items-center gap-1">
                    <Package className="w-3 h-3 text-stone-400 shrink-0" />
                    <p className="text-[13px] font-bold text-stone-700">
                      {totalItems}
                    </p>
                  </div>
                </div>

                {/* Keep this grid cell even when empty so every desktop order aligns. */}
                <div className="min-w-0">
                  {hasSavingsInfo && (
                    <>
                      <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-stone-400">
                        Savings
                      </p>

                      <div className="space-y-0.5">
                        {hasSubsidyUsed && (
                          <div className="flex items-center gap-1.5 text-[11px] font-bold tabular-nums text-emerald-700">
                            <Sparkles className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                              -{fmt(subsidyUsed)} today
                            </span>
                          </div>
                        )}
                        {hasSavedToWallet && (
                          <div className="flex items-center gap-1.5 text-[11px] font-bold tabular-nums text-violet-700">
                            <Wallet className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                              +{fmt(savedToWallet)} wallet
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Total */}
                <div className="min-w-[108px] text-right tabular-nums">
                  <div className="mb-1 flex items-center justify-end gap-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">
                      Total
                    </span>
                    {hasSubsidyUsed && (
                      <span className="text-[11px] font-medium leading-none text-stone-500 line-through decoration-1 decoration-current/70">
                        {fmtBefore(originalTotal)}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-[16px] font-bold leading-none text-green-700">
                    {fmt(order.cartTotal)}
                  </p>
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
        <OrderDetail
          order={order}
          customerId={customerId}
          allOrders={allOrders}
        />
      </DialogContent>
    </Dialog>
  );
}
