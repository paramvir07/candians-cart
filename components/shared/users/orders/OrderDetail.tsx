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
  // ── Breakdown maths ─────────────────────────────────────────────────────────
  // cartTotal    = final amount customer pays (subsidy already baked into item prices)
  // susbsidyUsed = informational: how much the store subsidised (already in item totals)
  // products[].total = per-item final price (after subsidy applied at item level)
  // TotalGST / TotalPST / TotalDisposableFee = tax/fee components

  const itemsSubtotal = order.products.reduce(
    (s: number, p: any) => s + (p.total ?? 0),
    0,
  );
  const totalGST = order.TotalGST ?? 0;
  const totalPST = order.TotalPST ?? 0;
  const totalFee = order.TotalDisposableFee ?? 0;
  const subsidyUsed = order.susbsidyUsed ?? 0;
  const cartTotal = order.cartTotal ?? 0;
  const hasSubsidy = subsidyUsed > 0;
  const hasFee = totalFee > 0;
  const hasPST = totalPST > 0;

  return (
    <div className="border-t border-border">
      {/* ── Product rows ────────────────────────────────────────────────── */}
      <div className="divide-y divide-border/50">
        {order.products.map((item: any, i: number) => {
          const p = item.productId;
          const imgUrl = p?.images?.[0]?.url;
          const itemSub = item.subsidy ?? 0;
          // unit price shown = (price + markup) before subsidy, so customer sees original vs paid
          const unitBase = (p?.price ?? 0) + (item.markup ?? 0);

          return (
            <div key={i} className="flex items-start gap-3 px-4 sm:px-5 py-3">
              {/* Thumbnail */}
              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
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

              {/* Name + subsidy badge */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground leading-tight truncate">
                  {p?.name ?? "Unknown product"}
                </p>
                <p className="text-xs text-muted-foreground">{p?.category}</p>
                {itemSub > 0 && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                    <Sparkles className="w-2.5 h-2.5" />-{fmt(itemSub)} subsidy
                  </span>
                )}
              </div>

              {/* Prices */}
              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground tabular-nums">
                  {fmt(unitBase)} × {item.quantity}
                </p>
                {itemSub > 0 && (
                  <p className="text-[10px] text-amber-600 tabular-nums">
                    -{fmt(itemSub)} subsidy
                  </p>
                )}
                <p className="text-sm font-bold text-foreground tabular-nums">
                  {fmt(item.total ?? 0)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Totals breakdown ────────────────────────────────────────────── */}
      <div className="mx-4 sm:mx-5 mt-2 mb-3 rounded-xl border border-border bg-muted/30 overflow-hidden">
        <div className="px-4 py-3 space-y-2 text-sm">
          {/* Items subtotal */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              Items ({order.products.length})
            </span>
            <span className="font-medium tabular-nums">
              {fmt(itemsSubtotal)}
            </span>
          </div>

          {/* Taxes */}
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

          {/* Subsidy info row — shown as reference, already in item prices */}
          {hasSubsidy && (
            <>
              <Separator className="my-0.5" />
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-amber-700 text-xs font-medium">
                  <Sparkles className="w-3 h-3" />
                  Subsidy (applied to items)
                </span>
                <span className="text-xs font-semibold text-amber-700 tabular-nums">
                  -{fmt(subsidyUsed)}
                </span>
              </div>
            </>
          )}

          <Separator className="my-0.5" />

          {/* Grand total */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground">Total paid</span>
            <span className="font-bold text-primary text-base tabular-nums">
              {fmt(cartTotal)}
            </span>
          </div>
        </div>

        {/* Subsidy note banner */}
        {hasSubsidy && (
          <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-snug">
              <span className="font-semibold">Subsidised order</span> — your
              store covered{" "}
              <span className="font-semibold">{fmt(subsidyUsed)}</span> on this
              order.
            </p>
          </div>
        )}
      </div>

      {/* ── Actions ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 sm:px-5 pb-4 pt-1">
        <ReorderBtn
          OrderId={order._id}
          customerId={customerId}
          orderStatus={order.status}
          allOrders={allOrders}
          orderCustomerId={order.userId}
        />
        {!customerId && !allOrders && <QrCodeButton orderId={order._id} />}
      </div>
    </div>
  );
}
