"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Package, Search } from "lucide-react";
import { type DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrderWithProductsClient } from "@/types/customer/OrdersClient";
import OrderCard from "./OrderCard";
import CustomerAdvertisements from "@/components/customer/shared/CustomerAdvertisements";
import { DatePickerWithRange } from "@/components/admin/analytics/reciept/DatePickerWithRange"; // adjust path to wherever this actually lives
import { useDebounce } from "use-debounce";

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
  searchAllOrders,
  searchOrders,
} from "@/actions/customer/ProductAndStore/Order.Action";

const norm = (v: unknown) =>
  String(v ?? "")
    .trim()
    .toLowerCase();

type Filter = "all" | "pending" | "completed";

const EMPTY_ORDERS: OrderWithProductsClient[] = [];

export default function OrdersHistoryClient({
  customerId,
  allOrders,
  initialOrders = EMPTY_ORDERS,
  initialTotalPages = 1,
  immigrationRole,
}: {
  customerId?: string;
  allOrders?: boolean;
  initialOrders: OrderWithProductsClient[];
  initialTotalPages?: number;
  immigrationRole?: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  const [debouncedQ] = useDebounce(q, 400);
  const [debouncedDate] = useDebounce(date, 500);

  const [orders, setOrders] =
    useState<OrderWithProductsClient[]>(initialOrders);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isLoading, setIsLoading] = useState(false);

  const hasDateFilter = Boolean(debouncedDate?.from && debouncedDate?.to);

  // Whenever the search term or date range changes, jump back to page 1.
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQ, debouncedDate]);

  useEffect(() => {
    if (currentPage === 1 && !debouncedQ && !hasDateFilter) {
      setOrders(initialOrders);
      setTotalPages(initialTotalPages);
      return;
    }

    let mounted = true;
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const dateRange = hasDateFilter
          ? { from: debouncedDate!.from, to: debouncedDate!.to }
          : undefined;

        const res = debouncedQ
          ? allOrders
            ? await searchAllOrders(debouncedQ, currentPage, 5, dateRange)
            : await searchOrders(
                debouncedQ,
                customerId,
                currentPage,
                5,
                dateRange,
              )
          : allOrders
            ? await getAllOrders(currentPage, 5, dateRange)
            : await getOrders(customerId, currentPage, 5, dateRange);

        if (!mounted) return;

        if (res?.success) {
          setOrders(res.data ?? []);
          setTotalPages(res.totalPages ?? 1);
        } else {
          setOrders([]);
          setTotalPages(1);
        }
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
  }, [currentPage, debouncedQ, debouncedDate, allOrders, customerId]);

  const filteredOrders = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter((order) => norm(order.status) === filter);
  }, [orders, filter]);

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

  const pageTitle = customerId
    ? "Customer Orders"
    : immigrationRole
      ? "All Orders"
      : allOrders
        ? "All Orders"
        : "Order History";

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
      {!customerId && !allOrders && <CustomerAdvertisements maxHeight={250} />}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          {!immigrationRole && !customerId && !allOrders && (
            <Link href="/customer">
              <Button className="rounded-full" variant="outline" size="icon">
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </Link>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-950">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Search + Date filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={
              allOrders
                ? "Search by customer, product, or order ID..."
                : "Search by product or order ID..."
            }
            className="pl-9"
          />
        </div>
        <div className="sm:w-72">
          <DatePickerWithRange date={date} setDate={setDate} />
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
            {(q || hasDateFilter) && (
              <button
                onClick={() => {
                  setQ("");
                  setDate(undefined);
                }}
                className="text-xs text-primary underline underline-offset-2 mt-1"
              >
                Clear filters
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
