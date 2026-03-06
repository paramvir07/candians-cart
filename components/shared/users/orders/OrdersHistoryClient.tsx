"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import ReorderBtn from "@/components/customer/orderHistory/ReorderBtn";
import { OrderWithProductsClient } from "@/types/customer/OrdersClient";
import QrCodeButton from "./QrCodeButton";
import QrScannerButton from "../QrScannerButton";

/** cents → "3.99" (keep your existing logic) */
const fmt = (cents: number) => (cents / 100).toFixed(2);

const PLACEHOLDER =
  "https://i.pinimg.com/736x/0d/aa/29/0daa294d95b91e53007b5e472ad6a492.jpg";

type Filter = "all" | "pending" | "refunded";

const norm = (v: unknown) =>
  String(v ?? "")
    .trim()
    .toLowerCase();

export default function OrdersHistoryClient({
  customerId,
  orders,
}: {
  customerId?: string;
  orders: OrderWithProductsClient[];
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const handleScanResult = (scannedId: string) => {
    setQ(scannedId);
  };

  const filteredOrders = useMemo(() => {
    const query = norm(q);

    return orders.filter((order: any) => {
      // filter by status
      const status = norm(order.status);
      const okStatus =
        filter === "all"
          ? true
          : filter === "pending"
            ? status === "pending"
            : status === "refunded";

      if (!okStatus) return false;
      if (!query) return true;

      // search by order id + product name (and optional fields)
      const shortId = order._id?.toString().slice(-7).toUpperCase();
      const fullId = order._id?.toString();

      const names =
        order.products?.map((it: any) => it?.productId?.name).filter(Boolean) ??
        [];

      const haystack = norm(
        [
          shortId,
          fullId,
          ...names,
          order.status,
          order.paymentMode, // optional: include in search
        ].join(" "),
      );

      return haystack.includes(query);
    });
  }, [orders, filter, q]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <Link
            href={
              customerId
                ? `/cashier/customer/${customerId}`
                : "/customer/profile"
            }
          >
            <Button className="rounded-full" variant="outline" size="icon">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-950">
            {customerId ? "Customer order history" : "Order history"}
          </h1>
        </div>

        <p className="text-sm text-gray-500 mt-0.5">
          You have{" "}
          <span className="font-semibold text-gray-900">
            {orders.length} orders
          </span>{" "}
          in total
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            View all
          </Button>
          <Button
            size="sm"
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
          >
            Pending
          </Button>
          <Button
            size="sm"
            variant={filter === "refunded" ? "default" : "outline"}
            onClick={() => setFilter("refunded")}
          >
            Refunded
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center justify-center gap-3">
          {customerId && <QrScannerButton onScan={handleScanResult} />}
          <div className="relative w-full sm:w-56 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="text"
              placeholder="Order ID, product name..."
              className="pl-8 text-sm h-9 bg-white border-gray-200 placeholder:text-gray-400 w-full"
            />
          </div>
        </div>
      </div>

      {/* Order Cards */}
      <div className="mt-6 flex flex-col gap-3">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-muted-foreground text-sm">No orders found.</p>
          </div>
        ) : (
          filteredOrders.map((order: any) => {
            const firstProduct = order.products?.[0];
            const thumbUrl =
              firstProduct?.productId?.images?.[0]?.url ?? PLACEHOLDER;

            const orderId = order._id.toString().slice(-7).toUpperCase();
            const date = new Date(order.createdAt).toLocaleDateString("en-CA", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <Card
                key={order._id.toString()}
                className="w-full border-border overflow-hidden"
              >
                <CardHeader className="hidden">
                  <CardTitle />
                </CardHeader>

                <CardContent className="p-0">
                  <Accordion type="single" collapsible>
                    <AccordionItem
                      value={order._id.toString()}
                      className="border-none"
                    >
                      <AccordionTrigger className="hover:no-underline cursor-pointer hover:bg-muted/40 transition-colors px-4 py-4 sm:px-5 [&>svg]:shrink-0">
                        <div className="flex items-center gap-3 w-full min-w-0">
                          {/* Thumbnail */}
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-muted shrink-0 ring-2 ring-primary/10">
                            <Image
                              src={thumbUrl}
                              alt="Order thumbnail"
                              width={56}
                              height={56}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Meta */}
                          <div className="flex-1 min-w-0">
                            {/* Mobile */}
                            <div className="flex items-center justify-between sm:hidden mr-2">
                              <div>
                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                                  Order
                                </p>
                                <p className="text-sm font-bold text-foreground tabular-nums">
                                  #{orderId}
                                </p>

                                {/* ✅ paymentMode mobile */}
                                <p className="text-[11px] text-muted-foreground mt-1">
                                  Payment:{" "}
                                  <span className="font-semibold text-foreground">
                                    {order.paymentMode ?? "—"}
                                  </span>
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                                  Total
                                </p>
                                <p className="text-sm font-bold text-primary tabular-nums">
                                  CA${fmt(order.cartTotal)}
                                </p>
                              </div>
                            </div>

                            {/* Desktop */}
                            <div className="hidden sm:flex items-center gap-10 w-full">
                              <div>
                                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                                  Order number
                                </p>
                                <p className="text-sm font-bold text-foreground tabular-nums">
                                  #{orderId}
                                </p>
                              </div>

                              <div>
                                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                                  Ordered date
                                </p>
                                <p className="text-sm font-bold text-foreground">
                                  {date}
                                </p>
                              </div>

                              <div>
                                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                                  Items
                                </p>
                                <p className="text-sm font-bold text-foreground">
                                  {order.products.length}
                                </p>
                              </div>

                              {/* ✅ paymentMode desktop */}
                              <div>
                                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                                  Payment
                                </p>
                                <p className="text-sm font-bold text-foreground">
                                  {order.paymentMode ?? "—"}
                                </p>
                              </div>

                              <div className="ml-auto">
                                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                                  Total
                                </p>
                                <p className="text-sm font-bold text-primary tabular-nums">
                                  CA${fmt(order.cartTotal)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="px-4 sm:px-5 pb-4">
                        {/* Product rows */}
                        <div className="border-t border-border divide-y divide-border">
                          {order.products.map((item: any, i: number) => {
                            const p = item.productId;
                            const imgUrl = p?.images?.[0]?.url ?? PLACEHOLDER;

                            return (
                              <div
                                key={i}
                                className="flex items-center gap-4 py-3"
                              >
                                <div className="w-11 h-11 rounded-lg overflow-hidden bg-muted shrink-0">
                                  <Image
                                    src={imgUrl}
                                    alt={p?.name ?? "Product"}
                                    width={44}
                                    height={44}
                                    className="w-full h-full object-cover"
                                  />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-foreground leading-tight truncate">
                                    {p?.name ?? "Unknown product"}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {p?.category}
                                  </p>
                                </div>

                                <div className="flex items-center gap-3 shrink-0 text-right">
                                  <p className="text-xs text-muted-foreground tabular-nums hidden sm:block">
                                    CA${fmt(p?.price ?? 0)} × {item.quantity}
                                  </p>
                                  <p className="text-sm font-bold text-foreground tabular-nums w-16">
                                    CA${fmt(item.total)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 mt-1 border-t border-border">
                          <div className="flex items-center gap-2">
                            <ReorderBtn
                              OrderId={order._id}
                              customerId={customerId}
                              orderStatus={order.status}
                            />
                            {!customerId && (
                              <QrCodeButton orderId={order._id} />
                            )}
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {order.products.length} item
                              {order.products.length !== 1 ? "s" : ""}
                            </p>
                            <p className="text-lg font-bold text-foreground tabular-nums">
                              CA${fmt(order.cartTotal)}
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
