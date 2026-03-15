"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Search,
  ShoppingCart,
  Store,
  User,
  Eye,
  Calendar,
  Filter,
  Download,
  CalendarDays,
  CheckCircle2,
  Clock,
} from "lucide-react";
import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { AdminOrder, getOrdersPaginated, searchOrders } from "@/actions/admin/orders/getOrders.action";
import { OrderStats } from "@/actions/admin/orders/getOrderStats.action";

// ─── Skeleton rows ──────────────────────────────────────────────────────────────
const OrderRowSkeleton = () => (
  <tr className="border-b border-gray-50">
    {[24, 28, 28, 16, 20, 16, 24].map((w, i) => (
      <td key={i} className="px-4 py-3.5">
        <Skeleton className={`h-5 w-${w} rounded-md`} />
      </td>
    ))}
  </tr>
);

const StatSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 space-y-2">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-8 w-16" />
    <Skeleton className="h-3 w-20" />
  </div>
);

// ─── Badge helpers ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    completed: "bg-green-100 text-green-700",
  };
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap ${map[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {status}
    </span>
  );
}

function PaymentBadge({ mode }: { mode: string }) {
  const map: Record<string, string> = {
    wallet: "bg-violet-100 text-violet-700",
    cash: "bg-emerald-100 text-emerald-700",
    card: "bg-blue-100 text-blue-700",
    pending: "bg-red-100 text-red-600",
  };
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap ${map[mode] ?? "bg-gray-100 text-gray-600"}`}
    >
      {mode}
    </span>
  );
}

function formatCents(cents: number) {
  return (
    "$" +
    (cents / 100).toLocaleString("en-CA", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── Stat card ──────────────────────────────────────────────────────────────────
function OrderStatCard({
  label,
  value,
  sub,
  icon: Icon,
  bg,
  border,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
  bg: string;
  border: string;
}) {
  return (
    <div className={`${bg} border ${border} rounded-2xl p-4 sm:p-5`}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs sm:text-sm text-gray-500 font-medium">{label}</p>
        <Icon className={`w-4 h-4 shrink-0`} />
      </div>
      <p
        className={`text-2xl sm:text-3xl font-bold tracking-tight`}
      >
        {value}
      </p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

// ─── Types ──────────────────────────────────────────────────────────────────────
type StatusFilter = "all" | "pending" | "completed";
type DateFilter = "all" | "today" | "week" | "month";

interface OrdersListProps {
  storeId?: string;
  /** Pre-loaded stats from server (passed from page.tsx) */
  stats?: OrderStats;
}

// ─── Component ─────────────────────────────────────────────────────────────────
export function OrdersList({ storeId, stats }: OrdersListProps) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  const isAllStores = !storeId;

  const load = async (page = currentPage) => {
    setIsLoading(true);
    const result = await getOrdersPaginated(
      storeId,
      page,
      15,
      statusFilter,
      dateFilter,
    );
    if (result.success) {
      setOrders(result.data);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
    } else {
      toast.error(result.error || "Failed to fetch orders");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isSearchMode) return;
    load(currentPage);
  }, [storeId, currentPage, isSearchMode, statusFilter, dateFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, dateFilter]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setIsSearchMode(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchMode(true);
      setIsLoading(true);
      const res = await searchOrders(searchQuery, storeId, statusFilter);
      if (res.success) {
        setOrders(res.data);
        setTotalCount(res.totalCount);
      } else toast.error(res.error || "Search failed");
      setIsLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery, storeId, statusFilter]);

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

  const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Completed", value: "completed" },
  ];

  const DATE_FILTERS: { label: string; value: DateFilter }[] = [
    { label: "All time", value: "all" },
    { label: "Today", value: "today" },
    { label: "Last 7 days", value: "week" },
    { label: "This month", value: "month" },
  ];

  return (
    <div className="space-y-5">
      {/* ── Stat Cards ───────────────────────────────────────────────────────── */}
      {stats ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <OrderStatCard
            label="Daily Orders"
            value={stats.dailyOrders}
            sub="Today"
            icon={CalendarDays}
            bg="bg-blue-50/60"
            border="border-blue-100"
          />
          <OrderStatCard
            label="Monthly Orders"
            value={stats.monthlyOrders}
            sub="This month"
            icon={Calendar}
            bg="bg-emerald-50/60"
            border="border-emerald-100"
          />
          <OrderStatCard
            label="Total Orders"
            value={stats.totalOrders.toLocaleString()}
            sub="All time"
            icon={ShoppingCart}
            bg="bg-amber-50/60"
            border="border-amber-100"
          />
          <OrderStatCard
            label="Pending"
            value={stats.pendingOrders}
            sub="Awaiting"
            icon={Clock}
            bg="bg-rose-50/60"
            border="border-rose-100"
          />
          <OrderStatCard
            label="Completed"
            value={stats.completedOrders.toLocaleString()}
            sub="All time"
            icon={CheckCircle2}
            bg="bg-green-50/60"
            border="border-green-100"
          />
          <OrderStatCard
            label="Total Revenue"
            value={formatCents(stats.totalRevenue)}
            sub="From orders"
            icon={ShoppingCart}
            bg="bg-violet-50/60"
            border="border-violet-100"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
      )}

      {/* ── Header + Search + Filters ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 pt-5 pb-4 border-b border-gray-50">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="bg-blue-50 p-1.5 rounded-lg">
                <ShoppingCart className="w-4 h-4 text-blue-600" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">
                {isAllStores ? "All Orders" : "Customer Orders"}
              </h1>
              {!isLoading && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full tabular-nums">
                  {totalCount.toLocaleString()}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5 ml-8">
              {isAllStores
                ? "View and manage all incoming orders"
                : "View and manage all incoming orders for in-store pickup"}
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search order, store or customer..."
              className="pl-10 rounded-xl h-9 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-3 border-b border-gray-50 bg-gray-50/40">
          {/* Status filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-xs text-gray-400 font-medium mr-1">
              Status:
            </span>
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === f.value
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="w-px h-4 bg-gray-200 hidden sm:block" />

          {/* Date filter */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-xs text-gray-400 font-medium mr-1">
              Period:
            </span>
            {DATE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setDateFilter(f.value)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  dateFilter === f.value
                    ? "bg-emerald-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/30">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Order ID
                </th>
                {isAllStores && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Store
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <OrderRowSkeleton key={i} />
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAllStores ? 8 : 7}
                    className="py-16 text-center"
                  >
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <ShoppingCart className="w-10 h-10 opacity-20" />
                      <p className="text-sm font-medium">
                        {isSearchMode
                          ? "No orders matched your search"
                          : "No orders found"}
                      </p>
                      {isSearchMode && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="text-xs text-emerald-600 underline underline-offset-2"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.orderId}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    {/* Order ID */}
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                        {order.orderRef}
                      </span>
                    </td>

                    {/* Store — all-stores view only */}
                    {isAllStores && (
                      <td className="px-4 py-3.5">
                        {order.storeId ? (
                          <Link
                            href={`/admin/store/${order.storeId}`}
                            className="group/s inline-flex items-center gap-1.5 hover:text-emerald-700 transition-colors"
                          >
                            <Store className="w-3.5 h-3.5 text-gray-300 group-hover/s:text-emerald-500 shrink-0" />
                            <span className="text-sm font-medium text-gray-700 truncate max-w-[110px] group-hover/s:underline underline-offset-2">
                              {order.storeName}
                            </span>
                          </Link>
                        ) : (
                          <span className="text-gray-300 text-sm">—</span>
                        )}
                      </td>
                    )}

                    {/* Customer */}
                    <td className="px-4 py-3.5">
                      {order.storeId && order.customerId ? (
                        <Link
                          href={`/admin/store/${order.storeId}/users`}
                          className="group/c inline-flex items-center gap-1.5 hover:text-blue-700 transition-colors"
                        >
                          <User className="w-3.5 h-3.5 text-gray-300 group-hover/c:text-blue-500 shrink-0" />
                          <span className="text-sm font-medium text-gray-700 truncate max-w-[120px] group-hover/c:underline underline-offset-2">
                            {order.customerName}
                          </span>
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-500">
                          {order.customerName}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-xs text-gray-400">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-gray-700 tabular-nums">
                      {formatCents(order.amount)}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <PaymentBadge mode={order.paymentMode} />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button className="p-1.5 rounded-lg text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 transition-colors opacity-0 group-hover:opacity-100">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {!isSearchMode && totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-50">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1 && !isLoading)
                        setCurrentPage((p) => p - 1);
                    }}
                    className={
                      currentPage === 1 || isLoading
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
                          if (currentPage !== page && !isLoading)
                            setCurrentPage(page as number);
                        }}
                        className={
                          isLoading
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
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
                      if (currentPage < totalPages && !isLoading)
                        setCurrentPage((p) => p + 1);
                    }}
                    className={
                      currentPage === totalPages || isLoading
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
    </div>
  );
}
