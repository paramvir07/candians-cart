"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Search, ShoppingCart, Store, User, Eye,
  Calendar, Filter, CalendarDays, CheckCircle2, Clock,
  TrendingUp, DollarSign, Package, ArrowUpRight,
  ChevronLeft, ChevronRight, MoreHorizontal, X,
} from "lucide-react";
import Link from "next/link";
import {
  AdminOrder,
  getOrdersPaginated,
  searchOrders,
} from "@/actions/admin/orders/getOrders.action";
import { OrderStats } from "@/actions/admin/orders/getOrderStats.action";

// ─── Skeletons ─────────────────────────────────────────────────────────────────

const OrderRowSkeleton = () => (
  <tr className="border-b border-border/40">
    {[32, 28, 28, 20, 20, 16, 20].map((w, i) => (
      <td key={i} className="px-4 py-4">
        <Skeleton className={`h-4 w-${w} rounded`} />
      </td>
    ))}
  </tr>
);

const StatSkeleton = () => (
  <div className="rounded-xl border border-border bg-card p-4 space-y-3 animate-pulse">
    <div className="flex items-center justify-between">
      <Skeleton className="h-3.5 w-20 rounded" />
      <Skeleton className="h-7 w-7 rounded-lg" />
    </div>
    <Skeleton className="h-7 w-16 rounded" />
    <Skeleton className="h-3 w-24 rounded" />
  </div>
);

// ─── Status & Payment Badges ────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending:   "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
  };
  const dots: Record<string, string> = {
    pending: "bg-amber-500",
    completed: "bg-emerald-500",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${styles[status] ?? "bg-muted text-muted-foreground border-border"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] ?? "bg-muted-foreground"}`} />
      {status}
    </span>
  );
}

function PaymentBadge({ mode }: { mode: string }) {
  const styles: Record<string, string> = {
    wallet:  "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800",
    cash:    "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-800",
    card:    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
    pending: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${styles[mode] ?? "bg-muted text-muted-foreground border-border"}`}>
      {mode}
    </span>
  );
}

function formatCents(cents: number) {
  return "$" + (cents / 100).toLocaleString("en-CA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, accent,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 hover:border-border/80 hover:shadow-md transition-all duration-200">
      {/* Subtle accent glow */}
      <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-[0.07] blur-xl ${accent}`} />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">{label}</p>
          <div className={`p-1.5 rounded-lg ${accent} bg-opacity-10`}>
            <Icon className="w-3.5 h-3.5 text-foreground/60" />
          </div>
        </div>
        <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <ArrowUpRight className="w-3 h-3" />
          {sub}
        </p>
      </div>
    </div>
  );
}

// ─── Customer Cell ──────────────────────────────────────────────────────────────

function CustomerCell({ order, role }: { order: AdminOrder; role: "admin" | "store" }) {
  const inner = (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
        <User className="w-3 h-3 text-muted-foreground" />
      </div>
      <span className="text-sm font-medium text-foreground truncate max-w-[130px]">
        {order.customerName}
      </span>
    </div>
  );

  if (role === "admin" && order.customerId) {
    return (
      <Link
        href={`/admin/customers/${order.customerId}`}
        className="hover:opacity-75 transition-opacity"
      >
        {inner}
      </Link>
    );
  }
  return inner;
}

// ─── Types ──────────────────────────────────────────────────────────────────────

type StatusFilter = "all" | "pending" | "completed";
type DateFilter = "all" | "today" | "week" | "month";

interface OrdersListProps {
  storeId?: string;
  stats?: OrderStats;
  role?: "admin" | "store";
}

// ─── Filter Pill ───────────────────────────────────────────────────────────────

function FilterPill<T extends string>({
  value, current, onClick, label,
}: {
  value: T;
  current: T;
  onClick: (v: T) => void;
  label: string;
}) {
  const active = value === current;
  return (
    <button
      onClick={() => onClick(value)}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export function OrdersList({ storeId, stats, role = "admin" }: OrdersListProps) {
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
    const result = await getOrdersPaginated(storeId, page, 15, statusFilter, dateFilter);
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

  useEffect(() => { setCurrentPage(1); }, [statusFilter, dateFilter]);

  useEffect(() => {
    if (!searchQuery.trim()) { setIsSearchMode(false); return; }
    const timer = setTimeout(async () => {
      setIsSearchMode(true);
      setIsLoading(true);
      const res = await searchOrders(searchQuery, storeId, statusFilter);
      if (res.success) { setOrders(res.data); setTotalCount(res.totalCount); }
      else toast.error(res.error || "Search failed");
      setIsLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery, storeId, statusFilter]);

  const getPageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 5) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
    else if (currentPage <= 3) pages.push(1, 2, 3, 4, "ellipsis", totalPages);
    else if (currentPage >= totalPages - 2) pages.push(1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    else pages.push(1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages);
    return pages;
  };

  const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
    { label: "All status", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Completed", value: "completed" },
  ];

  const DATE_FILTERS: { label: string; value: DateFilter }[] = [
    { label: "All time", value: "all" },
    { label: "Today", value: "today" },
    { label: "Last 7 days", value: "week" },
    { label: "This month", value: "month" },
  ];

  const colCount = (isAllStores ? 1 : 0) + 7;

  return (
    <div className="space-y-5">

      {/* ── Stat Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {stats ? (
          <>
            <StatCard label="Daily Orders"   value={stats.dailyOrders}                       sub="Today"            icon={CalendarDays}  accent="bg-blue-500"   />
            <StatCard label="Monthly"         value={stats.monthlyOrders}                      sub="This month"       icon={Calendar}       accent="bg-emerald-500"/>
            <StatCard label="Total Orders"    value={stats.totalOrders.toLocaleString()}        sub="All time"         icon={Package}        accent="bg-amber-500"  />
            <StatCard label="Pending"         value={stats.pendingOrders}                      sub="Awaiting action"  icon={Clock}          accent="bg-rose-500"   />
            <StatCard label="Completed"       value={stats.completedOrders.toLocaleString()}   sub="Successfully done" icon={CheckCircle2}  accent="bg-teal-500"   />
            <StatCard label="Revenue"         value={formatCents(stats.totalRevenue)}           sub="Total earnings"   icon={DollarSign}     accent="bg-violet-500" />
          </>
        ) : (
          Array.from({ length: 6 }).map((_, i) => <StatSkeleton key={i} />)
        )}
      </div>

      {/* ── Table Card ─────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">

        {/* Top bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between px-5 py-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <ShoppingCart className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground leading-tight">
                {isAllStores ? "All Orders" : "Store Orders"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isAllStores ? "Manage and track all incoming orders" : "Orders for this store"}
              </p>
            </div>
            {!isLoading && (
              <Badge variant="secondary" className="ml-1 tabular-nums text-xs font-semibold">
                {totalCount.toLocaleString()}
              </Badge>
            )}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder={`Search orders${isAllStores ? ", stores" : ""} or customers…`}
              className="pl-9 pr-9 h-9 rounded-lg text-sm bg-background border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 px-5 py-2.5 border-b border-border/60 bg-muted/30">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium shrink-0">Status:</span>
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-background border border-border">
              {STATUS_FILTERS.map((f) => (
                <FilterPill key={f.value} value={f.value} current={statusFilter} onClick={setStatusFilter} label={f.label} />
              ))}
            </div>
          </div>

          <div className="w-px h-4 bg-border hidden sm:block shrink-0" />

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium shrink-0">Period:</span>
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-background border border-border">
              {DATE_FILTERS.map((f) => (
                <FilterPill key={f.value} value={f.value} current={dateFilter} onClick={setDateFilter} label={f.label} />
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead>
              <tr className="border-b border-border/60">
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Order
                </th>
                {isAllStores && (
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Store
                  </th>
                )}
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Payment
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => <OrderRowSkeleton key={i} />)
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-muted-foreground/40" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {isSearchMode ? "No results found" : "No orders yet"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {isSearchMode ? `Nothing matched "${searchQuery}"` : "Orders will appear here once created"}
                        </p>
                      </div>
                      {isSearchMode && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSearchQuery("")}
                          className="h-7 text-xs"
                        >
                          Clear search
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.orderId}
                    className="border-b border-border/40 hover:bg-muted/40 transition-colors duration-100 group"
                  >
                    {/* Order ID */}
                    <td className="px-5 py-3.5">
                      <code className="text-xs font-semibold text-foreground/70 bg-muted px-2 py-1 rounded-md font-mono tracking-tight">
                        {order.orderRef}
                      </code>
                    </td>

                    {/* Store */}
                    {isAllStores && (
                      <td className="px-4 py-3.5">
                        {order.storeId ? (
                          <Link
                            href={`/admin/store/${order.storeId}`}
                            className="group/s inline-flex items-center gap-2 hover:opacity-75 transition-opacity"
                          >
                            <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center shrink-0">
                              <Store className="w-3 h-3 text-muted-foreground" />
                            </div>
                            <span className="text-sm font-medium text-foreground truncate max-w-[110px]">
                              {order.storeName}
                            </span>
                          </Link>
                        ) : (
                          <span className="text-muted-foreground/40 text-sm">—</span>
                        )}
                      </td>
                    )}

                    {/* Customer */}
                    <td className="px-4 py-3.5">
                      <CustomerCell order={order} role={role} />
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {formatDate(order.createdAt)}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-semibold text-foreground tabular-nums">
                        {formatCents(order.amount)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <StatusBadge status={order.status} />
                    </td>

                    {/* Payment */}
                    <td className="px-4 py-3.5">
                      <PaymentBadge mode={order.paymentMode} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isSearchMode && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-border/60">
            <p className="text-xs text-muted-foreground hidden sm:block">
              Page <span className="font-medium text-foreground">{currentPage}</span> of{" "}
              <span className="font-medium text-foreground">{totalPages}</span>
            </p>
            <div className="flex items-center gap-1 mx-auto sm:mx-0">
              {/* Prev */}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg"
                disabled={currentPage === 1 || isLoading}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>

              {/* Pages */}
              {getPageNumbers().map((page, i) =>
                page === "ellipsis" ? (
                  <span key={i} className="px-1.5 text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </span>
                ) : (
                  <Button
                    key={i}
                    variant={currentPage === page ? "default" : "ghost"}
                    size="icon"
                    className={`h-8 w-8 rounded-lg text-xs font-medium ${
                      currentPage === page ? "" : "text-muted-foreground"
                    }`}
                    disabled={isLoading}
                    onClick={() => setCurrentPage(page as number)}
                  >
                    {page}
                  </Button>
                )
              )}

              {/* Next */}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg"
                disabled={currentPage === totalPages || isLoading}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}