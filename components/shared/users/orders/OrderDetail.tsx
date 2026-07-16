"use client";

import Image from "next/image";
import {
  Sparkles,
  Package,
  Receipt,
  Tag,
  ChevronDown,
  CalendarDays,
  Clock3,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReorderBtn from "@/components/customer/orderHistory/ReorderBtn";
import { CategoryIllustration } from "@/components/customer/shared/CategoryIllustration";
import QrCodeButton from "./QrCodeButton";
import { formatVancouverDate, formatVancouverTime } from "@/lib/timezone";

const fmt = (cents: number) => `CA$${(cents / 100).toFixed(2)}`;
const fmtBefore = (cents: number) => `$${(cents / 100).toFixed(2)}`;

interface OrderDetailProps {
  order: any;
  customerId?: string;
  allOrders?: boolean;
}

export default function OrderDetail({
  order,
  customerId,
  allOrders,
}: OrderDetailProps) {
  const totalGST = order.TotalGST ?? 0;
  const totalPST = order.TotalPST ?? 0;
  const totalFee = order.TotalDisposableFee ?? 0;

  const subsidyUsed = order.subsidyUsed ?? 0;
  const subsidyGenerated = order.subsidy ?? 0;

  const cartTotal = order.cartTotal ?? 0;
  const orderDate = formatVancouverDate(order.createdAt);
  const orderTime = formatVancouverTime(order.createdAt);

  const hasSubsidyUsed = subsidyUsed > 0;
  const hasSubsidyGenerated = subsidyGenerated > 0;
  const hasFee = totalFee > 0;
  const hasPST = totalPST > 0;

  const normalProducts = (order.products ?? []).filter(
    (item: any) => item.productId != null,
  );
  const subsidyProducts = (order.subsidyItems ?? []).filter(
    (item: any) => item.productId != null,
  );
  const miscProducts = order.miscItems ?? [];

  const rawItems = [
    ...normalProducts.map((item: any) => ({ ...item, __type: "normal" })),
    ...subsidyProducts.map((item: any) => ({ ...item, __type: "subsidy" })),
    ...miscProducts.map((item: any) => ({ ...item, __type: "misc" })),
  ];

  const PINNED_LAST_IDS = [
    "6a2f51207f6cc4d79650b794",
    "6a2f51897f6cc4d79650b796",
  ];

  const isPinned = (item: any) =>
    PINNED_LAST_IDS.includes(item.productId?._id?.toString());

  const nonSubsidisedAll = rawItems
    .filter((i: any) => !i.productId?.subsidised)
    .reverse();

  const nonSubsidisedPinned = nonSubsidisedAll.filter(isPinned);
  const nonSubsidisedRest = nonSubsidisedAll.filter((i: any) => !isPinned(i));

  const subsidised = rawItems
    .filter((i: any) => i.productId?.subsidised)
    .reverse();

  const allProducts = [
    ...nonSubsidisedRest,
    ...subsidised,
    ...nonSubsidisedPinned,
  ];
  const PlatformFee = 50;

  // const subtotal = cartTotal - totalGST - totalPST - totalFee - PlatformFee;
  const wasValue = cartTotal + subsidyUsed;
  const subsidySavedToWallet = Math.max(subsidyGenerated - subsidyUsed, 0);
  const oldWalletUsed = Math.max(subsidyUsed - subsidyGenerated, 0);

  return (
    <div className="flex flex-col h-full max-h-[85vh] bg-background rounded-2xl overflow-hidden">
      {/* ── Header ── */}
      <div className="shrink-0 px-4 pt-4 pb-3 border-b border-border/60 bg-background">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Receipt className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <h2 className="text-sm font-semibold text-foreground tracking-tight">
                Order Details
              </h2>
              {hasSubsidyUsed && (
                <span
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-50 text-amber-500"
                  aria-label="Savings applied"
                  title="Savings applied"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
            <p className="max-w-[220px] truncate font-mono text-[10px] text-muted-foreground">
              #{order?._id}
            </p>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3 w-3 shrink-0" />
                {orderDate}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-3 w-3 shrink-0" />
                {orderTime}
              </span>
            </div>
          </div>

          <div className="mr-9 min-w-[104px] shrink-0 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-right tabular-nums sm:min-w-[112px]">
            <div className="mb-1 flex items-center justify-end gap-1">
              <span className="text-[8px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Total
              </span>
              {hasSubsidyUsed && (
                <span className="text-[10px] font-medium leading-none text-muted-foreground line-through decoration-1 decoration-current/70">
                  {fmtBefore(wasValue)}
                </span>
              )}
            </div>

            <p className="text-[16px] font-bold leading-none text-primary sm:text-[17px]">
              {fmt(cartTotal)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-3 sm:px-5 pb-2">
          {/* Items list */}
          <div className="pt-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5 px-1">
              <Package className="w-3 h-3" />
              {allProducts.length} {allProducts.length === 1 ? "item" : "items"}
            </p>

            <div className="rounded-xl border border-border/60 overflow-hidden divide-y divide-border/50 bg-card">
              {allProducts
                .map((item: any, i: number) => {
                  // ── Misc item row ──
                  if (item.__type === "misc") {
                    return (
                      <div
                        key={`misc-${i}`}
                        className="flex items-start gap-2.5 px-3 py-3 hover:bg-muted/30 transition-colors"
                      >
                        <div className="relative w-10 h-10 rounded-md overflow-hidden bg-stone-100 shrink-0 border border-border/50 flex items-center justify-center">
                          <Tag className="w-4 h-4 text-stone-400" />
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2 flex-1 min-w-0">
                              {item.productName ?? "Misc item"}
                            </p>
                            <p className="text-xs font-bold text-foreground tabular-nums shrink-0 ml-1">
                              {fmt(item.total)}
                            </p>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <Badge
                              variant="outline"
                              className="h-4 px-1.5 text-[9px] font-semibold bg-stone-50 border-stone-200 text-stone-500 gap-0.5 w-fit"
                            >
                              Misc
                            </Badge>
                            <p className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                              {fmt(item.price)} × {item.quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const p = item.productId;
                  if (!p) return null;
                  const imgUrl = p?.images?.[0]?.url;
                  const itemSub = item.subsidy ?? 0;
                  const markup = item.markup ?? 0;
                  const lineTotal = Math.round(
                    (item.total ?? 0) / (1 + (item.tax ?? 0)),
                  );
                  const isSubsidizedItem =
                    itemSub > 0 || item.__type === "subsidy" || p?.subsidised;
                  const originalLineTotal = lineTotal + itemSub;
                  const quantity = Math.max(Number(item.quantity) || 1, 1);
                  const paidUnitPrice = Math.round(lineTotal / quantity);
                  const originalUnitPrice = Math.round(
                    originalLineTotal / quantity,
                  );
                  const hasItemSaving =
                    itemSub > 0 && originalLineTotal > lineTotal;
                  return (
                    <div
                      key={`${item.__type}-${i}`}
                      className="flex items-start gap-2.5 px-3 py-3 hover:bg-muted/30 transition-colors"
                    >
                      {/* Image */}
                      <div className="relative w-10 h-10 rounded-md overflow-hidden bg-muted shrink-0 border border-border/50">
                        {imgUrl ? (
                          <Image
                            src={imgUrl}
                            alt={p?.name ?? "Product"}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <CategoryIllustration
                            category={p?.category ?? "Other"}
                          />
                        )}
                      </div>

                      {/* Info + Price stacked row */}
                      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                        {/* Top: name + total price */}
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2 flex-1 min-w-0">
                            {p?.name ?? "Unknown product"}
                          </p>
                          {!item.productId.subsidised && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-black leading-none ${
                                markup >= 100
                                  ? "bg-red-500 text-white"
                                  : markup >= 50
                                    ? "bg-amber-400 text-amber-950"
                                    : "bg-emerald-500 text-white"
                              }`}
                            >
                              {markup >= 100
                                ? "HIGH"
                                : markup >= 50
                                  ? "MED"
                                  : "LOW"}
                            </span>
                          )}
                          <div className="flex items-baseline gap-1.5 shrink-0 ml-1">
                            {isSubsidizedItem &&
                              originalLineTotal > lineTotal && (
                                <span className="text-[10px] font-semibold text-muted-foreground line-through decoration-1 decoration-current/70 tabular-nums">
                                  {fmt(originalLineTotal)}
                                </span>
                              )}
                            <span
                              className={`text-xs font-bold tabular-nums ${
                                hasItemSaving
                                  ? "text-amber-600"
                                  : "text-foreground"
                              }`}
                            >
                              {fmt(lineTotal)}
                            </span>
                          </div>
                        </div>

                        {/* Bottom: category + unit price */}
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[10px] text-muted-foreground truncate">
                            {p?.category}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] tabular-nums shrink-0">
                            {hasItemSaving && (
                              <span className="text-muted-foreground line-through decoration-1 decoration-current/70">
                                {fmt(originalUnitPrice)}
                              </span>
                            )}
                            <span
                              className={
                                hasItemSaving
                                  ? "font-semibold text-amber-600"
                                  : "text-foreground"
                              }
                            >
                              {fmt(paidUnitPrice)} × {quantity}
                            </span>
                          </div>
                        </div>

                        {isSubsidizedItem && (
                          <div className="flex items-center justify-between gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className="h-4 px-1.5 text-[9px] font-semibold bg-amber-50 border-amber-300 text-amber-700 gap-0.5"
                            >
                              <Sparkles className="w-2 h-2" />
                              Subsidized
                            </Badge>
                            {itemSub > 0 && (
                              <p className="text-[10px] font-semibold text-amber-600 tabular-nums shrink-0">
                                You saved {fmt(itemSub)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
                .filter(Boolean)}
            </div>
          </div>

          {/* ── Totals card ── */}
          <div className="mt-3 mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">
              Summary
            </p>

            <div className="rounded-xl border border-border/60 overflow-hidden bg-card">
              <div className="px-4 py-4 space-y-2 text-sm">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium tabular-nums">
                    {fmt(wasValue - 50)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span className="font-medium tabular-nums">{fmt(50)}</span>
                </div>

                {/* GST */}
                {totalGST > 0 && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>GST (5%)</span>
                    <span className="tabular-nums">{fmt(totalGST)}</span>
                  </div>
                )}

                {/* PST */}
                {hasPST && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>PST (7%)</span>
                    <span className="tabular-nums">{fmt(totalPST)}</span>
                  </div>
                )}

                {/* Disposable fee */}
                {hasFee && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Disposable fee</span>
                    <span className="tabular-nums">{fmt(totalFee)}</span>
                  </div>
                )}

                <Separator className="!my-3" />

                {hasSubsidyUsed && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Price before savings
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-muted-foreground line-through decoration-1 decoration-current/70">
                        {fmt(wasValue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-sm font-semibold text-emerald-700">
                        <Sparkles className="w-3.5 h-3.5" />
                        You saved today
                      </span>
                      <span className="text-sm font-bold text-emerald-700 tabular-nums">
                        {fmt(subsidyUsed)}
                      </span>
                    </div>
                  </>
                )}

                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Total paid</span>
                  <span className="font-bold text-primary text-base tabular-nums">
                    {fmt(cartTotal)}
                  </span>
                </div>
              </div>

              {/* Subsidy dropdown — only show information that applies */}
              {(hasSubsidyGenerated || hasSubsidyUsed) && (
                <details className="group bg-gradient-to-r from-amber-50/80 to-emerald-50/80 border-t border-amber-200/60">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                      <span className="text-xs font-bold text-foreground">
                        Savings summary
                      </span>
                    </div>

                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                  </summary>

                  <div className="px-4 pb-4 text-xs">
                    {(hasSubsidyGenerated || oldWalletUsed > 0) && (
                      <div className="space-y-2">
                        {hasSubsidyGenerated && (
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">
                              Earned on this order
                            </span>
                            <span className="font-bold text-amber-700 tabular-nums">
                              {fmt(subsidyGenerated)}
                            </span>
                          </div>
                        )}

                        {oldWalletUsed > 0 && (
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">
                              Used from Gift Wallet balance
                            </span>
                            <span className="font-semibold text-foreground tabular-nums">
                              {fmt(oldWalletUsed)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {(hasSubsidyGenerated || oldWalletUsed > 0) &&
                      (hasSubsidyUsed || subsidySavedToWallet > 0) && (
                        <div className="my-3 border-t border-emerald-200/70" />
                      )}

                    {(hasSubsidyUsed || subsidySavedToWallet > 0) && (
                      <div className="space-y-2.5">
                        {hasSubsidyUsed && (
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-semibold text-foreground">
                              Saved on this order
                            </span>
                            <span className="font-bold text-foreground tabular-nums">
                              {fmt(subsidyUsed)}
                            </span>
                          </div>
                        )}

                        {subsidySavedToWallet > 0 && (
                          <div className="flex items-center justify-between gap-3 rounded-lg bg-emerald-100/60 px-3 py-2">
                            <span className="font-bold text-emerald-900">
                              Saved to your wallet
                            </span>
                            <span className="font-bold text-emerald-700 tabular-nums">
                              {fmt(subsidySavedToWallet)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* ── Actions ── */}
      <div className="shrink-0 border-t border-border/60 px-3 sm:px-5 py-3 bg-background">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <ReorderBtn
              OrderId={order._id}
              customerId={customerId}
              orderStatus={order.status}
              allOrders={allOrders}
              orderCustomerId={order.userId}
              order={order}
            />
          </div>
          {!customerId && !allOrders && <QrCodeButton id={order._id} />}
        </div>
      </div>
    </div>
  );
}
