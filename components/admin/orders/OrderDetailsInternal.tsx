// components/admin/orders/OrderDetailInternal.tsx
"use client";

import Image from "next/image";
import { Sparkles, Package, Receipt, Tag, Store, User, CreditCard, Wallet, Clock, CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { CategoryIllustration } from "@/components/customer/shared/CategoryIllustration";

const fmt = (cents: number) => `CA$${(cents / 100).toFixed(2)}`;

function formatDate(date: Date | string) {
  return new Date(date).toLocaleString("en-CA", {
    timeZone: "America/Vancouver",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface OrderDetailInternalProps {
  order: any; // full order doc from getFullOrderDetails, populated
  role: "admin" | "store";
}

export default function OrderDetailInternal({ order, role }: OrderDetailInternalProps) {
  const totalGST = order.TotalGST ?? 0;
  const totalPST = order.TotalPST ?? 0;
  const totalFee = order.TotalDisposableFee ?? 0;
  const PlatformFee = 50;

  const subsidyGenerated = order.subsidy ?? 0;
  const subsidyUsed = order.subsidyUsed ?? 0;
  const cartTotal = order.cartTotal ?? 0;

  const storeProfit = order.storeProfit ?? 0;
  const platformProfit = order.platformProfit ?? 0;
  const profitLabel = role === "admin" ? "Platform Profit" : "Store Profit";
  const profitValue = role === "admin" ? platformProfit : storeProfit;

  const normalProducts = (order.products ?? []).filter((i: any) => i.productId != null);
  const subsidyProducts = (order.subsidyItems ?? []).filter((i: any) => i.productId != null);
  const miscProducts = order.miscItems ?? [];

  const allItems = [
    ...normalProducts.map((i: any) => ({ ...i, __type: "normal" })),
    ...subsidyProducts.map((i: any) => ({ ...i, __type: "subsidy" })),
    ...miscProducts.map((i: any) => ({ ...i, __type: "misc" })),
  ];

  const subtotal = cartTotal - totalGST - totalPST - totalFee - PlatformFee;
  const isCompleted = order.status === "completed";

  return (
    <div className="flex flex-col h-full max-h-[85vh] bg-background rounded-2xl overflow-hidden">
      {/* ── Header ── */}
      <div className="shrink-0 px-4 pt-4 pb-3 border-b border-border/60 bg-background">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <Receipt className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <h2 className="text-sm font-semibold text-foreground tracking-tight">
                {order.orderRef ?? `#${order._id?.toString().slice(-8)}`}
              </h2>
              <Badge
                variant="outline"
                className={`h-4.5 px-1.5 text-[9px] font-semibold gap-1 ${
                  isCompleted
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-amber-50 border-amber-200 text-amber-700"
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                {order.status}
              </Badge>
              <Badge variant="outline" className="h-4.5 px-1.5 text-[9px] font-semibold gap-1 bg-muted/50">
                {order.paymentMode === "wallet" ? <Wallet className="w-2.5 h-2.5" /> : <CreditCard className="w-2.5 h-2.5" />}
                {order.paymentMode}
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground">{formatDate(order.createdAt)}</p>
          </div>

          <div className="shrink-0 text-right bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
            <p className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground mb-0.5">
              {profitLabel}
            </p>
            <p className="text-base font-bold text-primary tabular-nums leading-none">{fmt(profitValue)}</p>
          </div>
        </div>

        {/* Store / Customer row */}
        <div className="flex items-center gap-3 mt-3">
          {role === "admin" && order.storeName && (
            <Link
              href={`/admin/store/${order.storeId?._id ?? order.storeId}`}
              className="flex items-center gap-1.5 text-xs font-medium text-foreground hover:opacity-70"
            >
              <Store className="w-3.5 h-3.5 text-muted-foreground" />
              {order.storeName}
            </Link>
          )}
          {order.customerName && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              {order.customerName}
            </span>
          )}
          {order.cashierId && (
            <Badge variant="outline" className="h-4.5 px-1.5 text-[9px] font-semibold bg-muted/50">
              Cashier order
            </Badge>
          )}
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-3 sm:px-5 pb-2">
          {/* Items */}
          <div className="pt-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5 px-1">
              <Package className="w-3 h-3" />
              {allItems.length} {allItems.length === 1 ? "item" : "items"}
            </p>

            <div className="rounded-xl border border-border/60 overflow-hidden divide-y divide-border/50 bg-card">
              {allItems.map((item: any, i: number) => {
                if (item.__type === "misc") {
                  return (
                    <div key={`misc-${i}`} className="flex items-start gap-2.5 px-3 py-3">
                      <div className="relative w-10 h-10 rounded-md overflow-hidden bg-stone-100 shrink-0 border border-border/50 flex items-center justify-center">
                        <Tag className="w-4 h-4 text-stone-400" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-foreground line-clamp-2 flex-1 min-w-0">
                            {item.productName ?? "Misc item"}
                          </p>
                          <p className="text-xs font-bold text-foreground tabular-nums shrink-0 ml-1">
                            {fmt(item.total)}
                          </p>
                        </div>
                        <p className="text-[10px] text-muted-foreground tabular-nums">
                          {fmt(item.price)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  );
                }

                const p = item.productId;
                if (!p) return null;
                const imgUrl = p?.images?.[0]?.url;
                const markup = item.markup ?? 0;
                const itemSub = item.subsidy ?? 0;
                const lineTotal = Math.round((item.total ?? 0) / (1 + (item.tax ?? 0)));
                const unitBase = item.quantity > 0 ? Math.round(lineTotal / item.quantity) : 0;

                return (
                  <div key={`${item.__type}-${i}`} className="flex items-start gap-2.5 px-3 py-3">
                    <div className="relative w-10 h-10 rounded-md overflow-hidden bg-muted shrink-0 border border-border/50">
                      {imgUrl ? (
                        <Image src={imgUrl} alt={p?.name ?? "Product"} fill className="object-cover" />
                      ) : (
                        <CategoryIllustration category={p?.category ?? "Other"} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-foreground line-clamp-2 flex-1 min-w-0">
                          {p?.name ?? "Unknown product"}
                        </p>
                        {!p?.subsidised && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-black leading-none ${
                              markup >= 100
                                ? "bg-red-500 text-white"
                                : markup >= 50
                                ? "bg-amber-400 text-amber-950"
                                : "bg-emerald-500 text-white"
                            }`}
                          >
                            {markup >= 100 ? "HIGH" : markup >= 50 ? "MED" : "LOW"}
                          </span>
                        )}
                        <p className="text-xs font-bold text-foreground tabular-nums shrink-0 ml-1">
                          {fmt(lineTotal)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] text-muted-foreground truncate">{p?.category}</p>
                        <p className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                          {fmt(unitBase)} × {item.quantity}
                        </p>
                      </div>
                      {itemSub > 0 && (
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <Badge variant="outline" className="h-4 px-1.5 text-[9px] font-semibold bg-amber-50 border-amber-200 text-amber-700 gap-0.5">
                            <Sparkles className="w-2 h-2" />
                            subsidy
                          </Badge>
                          <p className="text-[10px] text-amber-600 tabular-nums shrink-0">-{fmt(itemSub)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }).filter(Boolean)}
            </div>
          </div>

          {/* ── Financial Summary ── */}
          <div className="mt-3 mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">
              Financial Breakdown
            </p>
            <div className="rounded-xl border border-border/60 overflow-hidden bg-card">
              <div className="px-4 py-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium tabular-nums">{fmt(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Platform Fee</span>
                  <span className="tabular-nums">{fmt(PlatformFee)}</span>
                </div>
                {totalGST > 0 && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>GST (5%)</span>
                    <span className="tabular-nums">{fmt(totalGST)}</span>
                  </div>
                )}
                {totalPST > 0 && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>PST (7%)</span>
                    <span className="tabular-nums">{fmt(totalPST)}</span>
                  </div>
                )}
                {totalFee > 0 && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Disposable fee</span>
                    <span className="tabular-nums">{fmt(totalFee)}</span>
                  </div>
                )}
                <Separator className="!my-3" />
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Customer paid</span>
                  <span className="font-bold text-primary text-base tabular-nums">{fmt(cartTotal)}</span>
                </div>
              </div>

              {/* Subsidy + profit ledger — the part cashier/customer never see */}
              <div className="px-4 py-3 bg-muted/30 border-t border-border/60 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Subsidy generated (this order)</span>
                  <span className="font-medium tabular-nums text-amber-700">{fmt(subsidyGenerated)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Subsidy used (redeemed)</span>
                  <span className="font-medium tabular-nums text-emerald-700">{fmt(subsidyUsed)}</span>
                </div>
                {typeof order.subsidyLeft === "number" && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Customer subsidy balance after</span>
                    <span className="font-medium tabular-nums">{fmt(order.subsidyLeft)}</span>
                  </div>
                )}
                <Separator className="!my-2" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">{profitLabel}</span>
                  <span className="text-sm font-bold text-primary tabular-nums">{fmt(profitValue)}</span>
                </div>
                {role === "admin" && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Store profit (for reference)</span>
                    <span className="tabular-nums">{fmt(storeProfit)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}