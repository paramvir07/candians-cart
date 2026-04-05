"use client";

import Image from "next/image";
import { Sparkles, Package, Receipt, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReorderBtn from "@/components/customer/orderHistory/ReorderBtn";
import { CategoryIllustration } from "@/components/customer/shared/CategoryIllustration";
import QrCodeButton from "./QrCodeButton";

const fmt = (cents: number) => `CA$${(cents / 100).toFixed(2)}`;

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

  const hasSubsidyUsed = subsidyUsed > 0;
  const hasSubsidyGenerated = subsidyGenerated > 0;
  const hasFee = totalFee > 0;
  const hasPST = totalPST > 0;

  const normalProducts = order.products ?? [];
  const subsidyProducts = order.subsidyItems ?? [];

  const allProducts = [
    ...normalProducts.map((item: any) => ({ ...item, __type: "normal" })),
    ...subsidyProducts.map((item: any) => ({ ...item, __type: "subsidy" })),
  ];

  const subtotal = cartTotal - totalGST - totalPST - totalFee;

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
            </div>
            <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[180px]">
              #{order?._id}
            </p>
          </div>

          <div className="shrink-0 text-right bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
            <p className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground mb-0.5">
              Total paid
            </p>
            <p className="text-base font-bold text-primary tabular-nums leading-none">
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
              {allProducts.map((item: any, i: number) => {
                const p = item.productId;
                const imgUrl = p?.images?.[0]?.url;
                const itemSub = item.subsidy ?? 0;
                const unitBase =
                  (p?.price ?? 0) +
                  (p?.price ?? 0) * ((item.markup ?? 0) / 100);

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
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2 flex-1 min-w-0">
                          {p?.name ?? "Unknown product"}
                        </p>
                        <p className="text-xs font-bold text-foreground tabular-nums shrink-0 ml-1">
                          {fmt(unitBase * item.quantity)}
                        </p>
                      </div>

                      {/* Bottom: category + unit price */}
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] text-muted-foreground truncate">
                          {p?.category}
                        </p>
                        <p className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                          {fmt(unitBase)} × {item.quantity}
                        </p>
                      </div>

                      {itemSub > 0 && (
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <Badge
                            variant="outline"
                            className="h-4 px-1.5 text-[9px] font-semibold bg-amber-50 border-amber-200 text-amber-700 gap-0.5"
                          >
                            <Sparkles className="w-2 h-2" />
                            subsidy
                          </Badge>
                          <p className="text-[10px] text-amber-600 tabular-nums shrink-0">
                            -{fmt(itemSub)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
                  <span className="font-medium tabular-nums">{fmt(subtotal)}</span>
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

                {/* Subsidy used */}
                {hasSubsidyUsed && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <Sparkles className="w-3 h-3" />
                      Subsidy applied
                    </span>
                    <span className="font-semibold text-emerald-700 tabular-nums">
                      -{fmt(subsidyUsed)}
                    </span>
                  </div>
                )}

                <Separator className="!my-3" />

                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Total paid</span>
                  <span className="font-bold text-primary text-base tabular-nums">
                    {fmt(cartTotal)}
                  </span>
                </div>
              </div>

              {/* Subsidy summary footer */}
              {(hasSubsidyGenerated || hasSubsidyUsed) && (
                <div className="px-4 py-3 bg-gradient-to-r from-amber-50/80 to-emerald-50/80 border-t border-amber-200/60 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">
                      Subsidy summary
                    </span>{" "}
                    — generated{" "}
                    <span className="font-semibold text-amber-700">
                      {fmt(subsidyGenerated)}
                    </span>
                    {hasSubsidyUsed && (
                      <>
                        {" "}and used{" "}
                        <span className="font-semibold text-emerald-700">
                          {fmt(subsidyUsed)}
                        </span>
                      </>
                    )}{" "}
                    on this order.
                  </p>
                </div>
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
          {!customerId && !allOrders && (
            <QrCodeButton orderId={order._id} />
          )}
        </div>
      </div>
    </div>
  );
}