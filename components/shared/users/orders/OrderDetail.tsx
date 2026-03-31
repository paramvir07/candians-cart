"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";
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
    ...normalProducts.map((item: any) => ({
      ...item,
      __type: "normal",
    })),
    ...subsidyProducts.map((item: any) => ({
      ...item,
      __type: "subsidy",
    })),
  ];

  return (
    <div className="flex max-h-[78vh] flex-col">
      {/* Header / summary */}
      <div className="border-b border-border px-4 sm:px-6 py-4 bg-background sticky top-0 z-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              Order details
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-all">
              #{order?._id}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-left sm:text-right">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Total paid
            </p>
            <p className="text-lg font-bold text-primary tabular-nums">
              {fmt(cartTotal)}
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {/* Product rows */}
        <div className="divide-y divide-border/50">
          {allProducts.map((item: any, i: number) => {
            const p = item.productId;
            const imgUrl = p?.images?.[0]?.url;
            const itemSub = item.subsidy ?? 0;

            const unitBase =
              (p?.price ?? 0) + (p?.price ?? 0) * ((item.markup ?? 0) / 100);

            return (
              <div
                key={`${item.__type}-${i}`}
                className="flex items-start gap-3 px-4 sm:px-6 py-4"
              >
                <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                  {imgUrl ? (
                    <Image
                      src={imgUrl}
                      alt={p?.name ?? "Product"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <CategoryIllustration category={p?.category ?? "Other"} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-tight truncate">
                    {p?.name ?? "Unknown product"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {p?.category}
                  </p>

                  {itemSub > 0 && (
                    <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      <Sparkles className="w-2.5 h-2.5" />-{fmt(itemSub)}{" "}
                      subsidy used
                    </span>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {fmt(unitBase)} × {item.quantity}
                  </p>

                  {itemSub > 0 && (
                    <p className="text-[10px] text-amber-600 tabular-nums mt-1">
                      -{fmt(itemSub)} subsidy
                    </p>
                  )}

                  <p className="text-sm font-bold text-foreground tabular-nums mt-1">
                    {fmt(unitBase * item.quantity)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div className="px-4 sm:px-6 py-4">
          <div className="rounded-2xl border border-border bg-muted/30 overflow-hidden">
            <div className="px-4 py-4 space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Subtotal
                </span>
                <span className="font-medium tabular-nums">
                  {fmt(cartTotal - totalGST - totalPST - totalFee)}
                </span>
              </div>

              {totalGST > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">GST (5%)</span>
                  <span className="tabular-nums">{fmt(totalGST)}</span>
                </div>
              )}

              {hasPST && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">PST</span>
                  <span className="tabular-nums">{fmt(totalPST)}</span>
                </div>
              )}

              {hasFee && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Disposable fee</span>
                  <span className="tabular-nums">{fmt(totalFee)}</span>
                </div>
              )}

              {/* {hasSubsidyGenerated && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-amber-700 text-xs font-medium">
                    <Sparkles className="w-3 h-3" />
                    Subsidy generated
                  </span>
                  <span className="text-xs font-semibold text-amber-700 tabular-nums">
                    {fmt(subsidyGenerated)}
                  </span>
                </div>
              )} */}

              {hasSubsidyUsed && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-emerald-700 text-xs font-medium">
                    <Sparkles className="w-3 h-3" />
                    Subsidy used
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 tabular-nums">
                    -{fmt(subsidyUsed)}
                  </span>
                </div>
              )}

              <Separator className="my-1" />

              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">Total paid</span>
                <span className="font-bold text-primary text-base tabular-nums">
                  {fmt(cartTotal)}
                </span>
              </div>
            </div>

            {(hasSubsidyGenerated || hasSubsidyUsed) && (
              <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-emerald-50 border-t border-amber-200 flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-snug">
                  <span className="font-semibold text-foreground">
                    Subsidy summary
                  </span>{" "}
                  — generated{" "}
                  <span className="font-semibold text-amber-700">
                    {fmt(subsidyGenerated)}
                  </span>
                  {hasSubsidyUsed && (
                    <>
                      {" "}
                      and used{" "}
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

      {/* Actions */}
      <div className="border-t border-border px-4 sm:px-6 py-4 bg-background">
        <div className="flex items-center justify-between gap-3">
          <ReorderBtn
            OrderId={order._id}
            customerId={customerId}
            orderStatus={order.status}
            allOrders={allOrders}
            orderCustomerId={order.userId}
            order={order}
          />
          {!customerId && !allOrders && <QrCodeButton orderId={order._id} />}
        </div>
      </div>
    </div>
  );
}
