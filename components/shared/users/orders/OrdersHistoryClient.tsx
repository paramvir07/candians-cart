"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Search, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OrderWithProductsClient } from "@/types/customer/OrdersClient";
import QrScannerButton from "../QrScannerButton";
import OrderCard from "./OrderCard";
import CustomerAdvertisements from "@/components/customer/shared/CustomerAdvertisements";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import {
  getAllOrders,
  getOrders,
} from "@/actions/customer/ProductAndStore/Order.Action";

const norm = (v: unknown) =>
  String(v ?? "")
    .trim()
    .toLowerCase();

type Filter = "all" | "pending" | "completed";

export default function OrdersHistoryClient({
  customerId,
  allOrders,
  initialOrders = [],
  initialTotalPages = 1,
}: {
  customerId?: string;
  allOrders?: boolean;
  initialOrders: OrderWithProductsClient[];
  initialTotalPages?: number;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const [orders, setOrders] =
    useState<OrderWithProductsClient[]>(initialOrders);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isLoading, setIsLoading] = useState(false);

  const handleScanResult = (scannedId: string) => setQ(scannedId);

  useEffect(() => {
    if (currentPage === 1) {
      setOrders(initialOrders);
      setTotalPages(initialTotalPages);
      return;
    }

    let mounted = true;
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const res = allOrders
          ? await getAllOrders(currentPage, 5) // <-- 5 items
          : await getOrders(customerId, currentPage, 5);

        if (!mounted) return;

        // Safely extract the standardized paginated response
        const parsedRes = res as {
          data?: OrderWithProductsClient[];
          totalPages?: number;
        } | null;

        setOrders(parsedRes?.data ?? []);
        setTotalPages(parsedRes?.totalPages ?? 1);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchOrders();
    return () => {
      mounted = false;
    };
  }, [currentPage, allOrders, customerId]);

  const filteredOrders = useMemo(() => {
    const query = norm(q);
    return orders.filter((order) => {
      const okStatus = filter === "all" ? true : norm(order.status) === filter;
      if (!okStatus) return false;
      if (!query) return true;

      const shortId = order._id?.toString().slice(-7).toUpperCase();
      const names =
        order.products?.map((it) => it?.productId?.name).filter(Boolean) ?? [];

      const hay = norm(
        [
          shortId,
          order._id?.toString(),
          ...names,
          order.status,
          order.paymentMode,
        ].join(" "),
      );

      return hay.includes(query);
    });
  }, [orders, filter, q]);

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const completedCount = orders.filter((o) => o.status === "completed").length;

  const getPageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) pages.push(1, 2, 3, 4, "ellipsis", totalPages);
    else if (currentPage >= totalPages - 2)
      pages.push(
        1,
        "ellipsis",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      );
    else
      pages.push(
        1,
        "ellipsis",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "ellipsis",
        totalPages,
      );
    return pages;
  };

  const backHref = customerId
    ? `/cashier/customer/${customerId}`
    : allOrders
      ? "/cashier"
      : "/customer/";

  const pageTitle = customerId
    ? "Customer Orders"
    : allOrders
      ? "Store Orders"
      : "Order History";

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
      {!customerId && !allOrders && <CustomerAdvertisements maxHeight={250} />}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Link href={backHref}>
            <Button className="rounded-full" variant="outline" size="icon">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-950">
            {pageTitle}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground ml-11">
          <span className="font-semibold text-foreground">{orders.length}</span>{" "}
          total on page ·{" "}
          <span className="text-amber-600 font-medium">
            {pendingCount} pending
          </span>{" "}
          ·{" "}
          <span className="text-green-600 font-medium">
            {completedCount} completed
          </span>
        </p>
      </div>

      {/* Filters + search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
          >
            Pending {pendingCount > 0 && `(${pendingCount})`}
          </Button>
          <Button
            size="sm"
            variant={filter === "completed" ? "default" : "outline"}
            onClick={() => setFilter("completed")}
          >
            Completed {completedCount > 0 && `(${completedCount})`}
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(customerId || allOrders) && (
            <div className="shrink-0">
              <QrScannerButton onScan={handleScanResult} usedFor="orders" />
            </div>
          )}
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Order ID, product name…"
              className="pl-9 h-9 text-sm bg-white border-gray-200 placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Order list */}
      <div
        className={`flex flex-col gap-3 pb-8 transition-opacity duration-200 ${isLoading ? "opacity-50 pointer-events-none" : "opacity-100"}`}
      >
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
          filteredOrders.map((order) => (
            <OrderCard
              key={order._id.toString()}
              order={order}
              customerId={customerId}
              allOrders={allOrders}
            />
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {!isLoading && totalPages > 1 && (
        <div className="pt-4 border-t border-border mt-2 mb-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage((p) => p - 1);
                  }}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              {getPageNumbers().map((page, i) => (
                <PaginationItem key={i}>
                  {page === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href="#"
                      isActive={currentPage === page}
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage !== page)
                          setCurrentPage(page as number);
                      }}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
                  }}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
