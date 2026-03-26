"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  Search,
  ShoppingCart,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Receipt,
  Banknote,
  CreditCard,
  Wallet,
  Package,
  CalendarDays,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

import ReorderBtn from "@/components/customer/orderHistory/ReorderBtn";
import { OrderWithProductsClient } from "@/types/customer/OrdersClient";
import QrCodeButton from "./QrCodeButton";
import QrScannerButton from "../QrScannerButton";
import { CategoryIllustration } from "@/components/customer/shared/CategoryIllustration";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (cents: number) => `CA$${(cents / 100).toFixed(2)}`;
const norm = (v: unknown) =>
  String(v ?? "")
    .trim()
    .toLowerCase();

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

type Filter = "all" | "pending" | "completed";

// ─── Order detail panel ────────────────────────────────────────────────────────

function OrderDetail({ order }: { order: any }) {
  const hasSubsidy = (order.susbsidyUsed ?? 0) > 0;
  const hasFee = (order.TotalDisposableFee ?? 0) > 0;
  const hasSubItems = order.subsidyItems?.length > 0;

  return (
    <div className="border-t border-border">
      {/* Product rows */}
      <div className="divide-y divide-border/60">
        {order.products.map((item: any, i: number) => {
          const p = item.productId;
          const imgUrl = p?.images?.[0]?.url;
          const itemSub = item.subsidy ?? 0;
          const unitPrice = (p?.price ?? 0) + (item.markup ?? 0);

          return (
            <div key={i} className="flex items-start gap-3 px-4 sm:px-5 py-3">
              {/* Thumb */}
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

              {/* Info */}
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

              {/* Pricing */}
              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground tabular-nums">
                  {fmt(unitPrice)} × {item.quantity}
                </p>
                {itemSub > 0 && (
                  <p className="text-xs text-amber-600 tabular-nums line-through">
                    {fmt(unitPrice * item.quantity)}
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

      {/* Order totals */}
      <div className="mx-4 sm:mx-5 mt-2 mb-4 rounded-xl border border-border bg-muted/30 overflow-hidden">
        <div className="px-4 py-3 space-y-2 text-sm">
          {/* Subtotal */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Base total</span>
            <span className="font-medium tabular-nums">
              {fmt(order.BaseTotal ?? 0)}
            </span>
          </div>

          {/* Tax */}
          {(order.TotalGST ?? 0) > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">GST (5%)</span>
              <span className="tabular-nums">{fmt(order.TotalGST)}</span>
            </div>
          )}
          {(order.TotalPST ?? 0) > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">PST</span>
              <span className="tabular-nums">{fmt(order.TotalPST)}</span>
            </div>
          )}
          {hasFee && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Disposable fee</span>
              <span className="tabular-nums">
                {fmt(order.TotalDisposableFee)}
              </span>
            </div>
          )}

          {/* Subsidy */}
          {hasSubsidy && (
            <>
              <Separator className="my-1" />
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-amber-700 font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  Subsidy applied
                </span>
                <span className="font-semibold text-amber-700 tabular-nums">
                  -{fmt(order.susbsidyUsed)}
                </span>
              </div>
            </>
          )}

          <Separator className="my-1" />

          {/* Grand total */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground">Total paid</span>
            <span className="font-bold text-primary text-base tabular-nums">
              {fmt(order.cartTotal)}
            </span>
          </div>
        </div>

        {/* Subsidy info banner */}
        {hasSubsidy && (
          <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-snug">
              <span className="font-semibold">Subsidised order</span> — your
              store covered{" "}
              <span className="font-semibold">{fmt(order.susbsidyUsed)}</span>{" "}
              of this order.
            </p>
          </div>
        )}
      </div>

      {/* Action row */}
      <div className="flex items-center justify-between px-4 sm:px-5 pb-4 pt-1">
        <ReorderBtn
          OrderId={order._id}
          customerId={undefined}
          orderStatus={order.status}
          allOrders={false}
          orderCustomerId={order.userId}
        />
        <QrCodeButton orderId={order._id} />
      </div>
    </div>
  );
}

// ─── Order card ────────────────────────────────────────────────────────────────

function OrderCard({
  order,
  customerId,
  allOrders,
}: {
  order: any;
  customerId?: string;
  allOrders?: boolean;
}) {
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
      {/* Summary row — clickable */}
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
              {/* Mobile layout */}
              <div className="flex items-start justify-between sm:hidden">
                <div>
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

              {/* Desktop layout */}
              <div className="hidden sm:flex items-center gap-8">
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

            {/* Expand icon */}
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

      {/* Expanded detail */}
      {open && <OrderDetail order={order} />}
    </Card>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function OrdersHistoryClient({
  customerId,
  allOrders,
  orders,
}: {
  customerId?: string;
  allOrders?: boolean;
  orders: OrderWithProductsClient[];
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const handleScanResult = (scannedId: string) => setQ(scannedId);

  const filteredOrders = useMemo(() => {
    const query = norm(q);
    return orders.filter((order: any) => {
      const status = norm(order.status);
      const okStatus = filter === "all" ? true : status === filter;
      if (!okStatus) return false;
      if (!query) return true;

      const shortId = order._id?.toString().slice(-7).toUpperCase();
      const names =
        order.products?.map((it: any) => it?.productId?.name).filter(Boolean) ??
        [];
      const haystack = norm(
        [
          shortId,
          order._id?.toString(),
          ...names,
          order.status,
          order.paymentMode,
        ].join(" "),
      );
      return haystack.includes(query);
    });
  }, [orders, filter, q]);

  const pendingCount = orders.filter((o: any) => o.status === "pending").length;
  const completedCount = orders.filter(
    (o: any) => o.status === "completed",
  ).length;

  return (
    <div
      className={`max-w-3xl mx-auto py-6 sm:py-8 px-4 sm:px-6 ${customerId || allOrders ? "md:pl-30 lg:pl-20" : ""}`}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Link
            href={
              customerId
                ? `/cashier/customer/${customerId}`
                : allOrders
                  ? "/cashier"
                  : "/customer/profile"
            }
          >
            <Button className="rounded-full" variant="outline" size="icon">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {customerId
              ? "Customer Orders"
              : allOrders
                ? "Store Orders"
                : "Order History"}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground ml-11">
          <span className="font-semibold text-foreground">{orders.length}</span>{" "}
          total ·{" "}
          <span className="text-amber-600 font-medium">
            {pendingCount} pending
          </span>{" "}
          ·{" "}
          <span className="text-green-600 font-medium">
            {completedCount} completed
          </span>
        </p>
      </div>

      {/* Filter + search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          {(["all", "pending", "completed"] as Filter[]).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f === "all"
                ? "All"
                : f === "pending"
                  ? `Pending (${pendingCount})`
                  : `Completed (${completedCount})`}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(customerId || allOrders) && (
            <div className="shrink-0">
              <QrScannerButton onScan={handleScanResult} />
            </div>
          )}
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search order or product…"
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Orders */}
      <div className="flex flex-col gap-3">
        {filteredOrders.length === 0 ? (
          <div className="py-20 text-center">
            <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm font-medium">
              No orders found
            </p>
            {q && (
              <button
                onClick={() => setQ("")}
                className="text-xs text-primary underline underline-offset-2 mt-1"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          filteredOrders.map((order: any) => (
            <OrderCard
              key={order._id.toString()}
              order={order}
              customerId={customerId}
              allOrders={allOrders}
            />
          ))
        )}
      </div>
    </div>
  );
}
