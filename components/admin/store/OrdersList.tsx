"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "sonner";
import {
  Search,
  ShoppingCart,
  Store,
  User,
  Eye,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  DollarSign,
  Package,
  ArrowUpRight,
  X,
  Loader2,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import {
  AdminOrder,
  DateRange,
  getOrdersPaginated,
  searchOrders,
  getFullOrderDetails,
} from "@/actions/admin/orders/getOrders.action";
import { OrderStats } from "@/actions/admin/orders/getOrderStats.action";
import OrderDetail from "@/components/shared/users/orders/OrderDetail";
import { format } from "date-fns";
import { type DateRange as DayPickerDateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/admin/analytics/reciept/DatePickerWithRange";

// ─── useDebounce ────────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─── Period preset type ─────────────────────────────────────────────────────────

type PeriodPreset = "all" | "today" | "week" | "month" | "custom";

const PERIOD_OPTIONS: { label: string; value: PeriodPreset }[] = [
  { label: "All time", value: "all" },
  { label: "Today", value: "today" },
  { label: "This week", value: "week" },
  { label: "This month", value: "month" },
  { label: "Custom…", value: "custom" },
];

/** Convert a preset to a concrete DateRange (null = no filter). */
function presetToRange(preset: PeriodPreset): DateRange | null {
  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD local
  if (preset === "all" || preset === "custom") return null;
  if (preset === "today") return { from: today, to: today };
  if (preset === "week") {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return { from: d.toLocaleDateString("en-CA"), to: today };
  }
  if (preset === "month") {
    const d = new Date();
    return {
      from: new Date(d.getFullYear(), d.getMonth(), 1).toLocaleDateString(
        "en-CA",
      ),
      to: today,
    };
  }
  return null;
}

// ─── Skeletons ─────────────────────────────────────────────────────────────────

const OrderRowSkeleton = () => (
  <tr className="border-b border-border/40">
    {[32, 28, 28, 20, 20, 20].map((w, i) => (
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

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatCents(cents: number) {
  return (
    "$" +
    (cents / 100).toLocaleString("en-CA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 hover:border-border/80 hover:shadow-md transition-all duration-200">
      <div
        className={`absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-[0.07] blur-xl ${accent}`}
      />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
            {label}
          </p>
          <div className={`p-1.5 rounded-lg ${accent} bg-opacity-10`}>
            <Icon className="w-3.5 h-3.5 text-foreground/60" />
          </div>
        </div>
        <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
          {value}
        </p>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <ArrowUpRight className="w-3 h-3" />
          {sub}
        </p>
      </div>
    </div>
  );
}

// ─── Customer Cell ──────────────────────────────────────────────────────────────

function CustomerCell({
  order,
  role,
}: {
  order: AdminOrder;
  role: "admin" | "store";
}) {
  const inner = (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
        <User className="w-3 h-3 text-muted-foreground" />
      </div>
      <span className="text-sm font-medium text-foreground truncate max-w-32.5">
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

// ─── Period Filter ──────────────────────────────────────────────────────────────

function PeriodFilter({
  preset,
  customRange,
  onPresetChange,
  onCustomRangeChange,
}: {
  preset: PeriodPreset;
  customRange: DateRange | null;
  onPresetChange: (p: PeriodPreset) => void;
  onCustomRangeChange: (r: DateRange | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedLabel =
    PERIOD_OPTIONS.find((o) => o.value === preset)?.label ?? "All time";

  // Convert string dates (YYYY-MM-DD) to native Date objects for Shadcn DatePicker
  const datePickerValue: DayPickerDateRange | undefined = customRange
    ? {
        from: customRange.from
          ? new Date(customRange.from + "T00:00:00")
          : undefined,
        to: customRange.to ? new Date(customRange.to + "T00:00:00") : undefined,
      }
    : undefined;

  // Convert native Date objects back to string dates when the user selects a range
  const handleCustomDateChange = (range: DayPickerDateRange | undefined) => {
    if (!range || !range.from) {
      onCustomRangeChange(null);
      return;
    }
    onCustomRangeChange({
      from: format(range.from, "yyyy-MM-dd"),
      to: range.to
        ? format(range.to, "yyyy-MM-dd")
        : format(range.from, "yyyy-MM-dd"),
    });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground font-medium shrink-0">
        Period:
      </span>

      <div className="relative" ref={ref}>
        {/* Trigger */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-medium text-foreground hover:bg-muted/60 transition-colors h-9"
        >
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          {selectedLabel}
          <ChevronDown
            className={`w-3 h-3 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute left-0 top-full mt-1.5 z-30 min-w-[160px] rounded-xl border border-border bg-popover shadow-lg py-1 overflow-hidden">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onPresetChange(opt.value);
                  setOpen(false); // <-- CHANGED: Now this always closes the dropdown
                }}
                className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${
                  preset === opt.value
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted/60"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Shadcn Date Picker — only shown when preset === "custom" */}
      {preset === "custom" && (
        <div className="flex items-center gap-2 fade-in animate-in">
          <DatePickerWithRange
            date={datePickerValue}
            setDate={handleCustomDateChange}
          />
          {customRange && (
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => onCustomRangeChange(null)}
              title="Clear dates"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Types ──────────────────────────────────────────────────────────────────────

interface OrdersListProps {
  storeId?: string;
  stats?: OrderStats;
  role?: "admin" | "store";
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export function OrdersList({
  storeId,
  stats,
  role = "admin",
}: OrdersListProps) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Period state
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>("today");
  const [customRange, setCustomRange] = useState<DateRange | null>(null);

  // Modal
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrderData, setSelectedOrderData] = useState<AdminOrder | null>(
    null,
  );
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const isAllStores = !storeId;
  const debouncedSearch = useDebounce(searchQuery, 350);

  // Resolve the active DateRange from preset + custom, memoized to prevent infinite loops
  const activeDateRange = useMemo<DateRange | null>(() => {
    return periodPreset === "custom"
      ? customRange
      : presetToRange(periodPreset);
  }, [periodPreset, customRange?.from, customRange?.to]);

  // ── Load orders ──
  const load = async (page = currentPage) => {
    setIsLoading(true);
    const result = await getOrdersPaginated(storeId, page, 5, activeDateRange);
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
  }, [storeId, currentPage, isSearchMode, activeDateRange]);

  // Reset to page 1 on period change
  useEffect(() => {
    setCurrentPage(1);
  }, [periodPreset, customRange]);

  // ── Debounced search ──
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setIsSearchMode(false);
      return;
    }
    setIsSearchMode(true);
    setIsLoading(true);
    searchOrders(debouncedSearch, storeId).then((res) => {
      if (res.success) {
        setOrders(res.data);
        setTotalCount(res.totalCount);
      } else {
        toast.error(res.error || "Search failed");
      }
      setIsLoading(false);
    });
  }, [debouncedSearch, storeId]);

  const handleViewOrder = async (orderId: string) => {
    setIsDetailOpen(true);
    setIsLoadingDetail(true);
    setSelectedOrderData(null);
    const res = await getFullOrderDetails(orderId);
    if (res.success) {
      setSelectedOrderData(res.data);
    } else {
      toast.error(res.error || "Failed to load order details");
      setIsDetailOpen(false);
    }
    setIsLoadingDetail(false);
  };

  const getPageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, "ellipsis", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(
        1,
        "ellipsis",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      );
    } else {
      pages.push(
        1,
        "ellipsis",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "ellipsis",
        totalPages,
      );
    }
    return pages;
  };

  // Order, [Store], Customer, Date, Amount, Actions
  const colCount = (isAllStores ? 1 : 0) + 6;

  return (
    <div className="space-y-5">
      {/* ── Order Detail Modal ── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent
          aria-describedby={undefined}
          className="max-w-md md:max-w-2xl p-0 bg-transparent border-none shadow-none [&>button]:hidden"
        >
          <DialogTitle className="sr-only">Order Details</DialogTitle>
          {isLoadingDetail ? (
            <div className="bg-background rounded-2xl p-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground font-medium">
                Loading order details...
              </p>
            </div>
          ) : selectedOrderData ? (
            <div className="relative bg-background rounded-2xl overflow-hidden shadow-2xl">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="absolute top-3.5 right-4 z-50 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-muted transition-colors border border-border/50"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
              <OrderDetail order={selectedOrderData as any} allOrders={true} />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {stats ? (
          <>
            <StatCard
              label="Daily Orders"
              value={stats.dailyOrders}
              sub="Today"
              icon={CalendarDays}
              accent="bg-blue-500"
            />
            <StatCard
              label="Monthly"
              value={stats.monthlyOrders}
              sub="This month"
              icon={Calendar}
              accent="bg-emerald-500"
            />
            <StatCard
              label="Total Orders"
              value={stats.totalOrders.toLocaleString()}
              sub="All time"
              icon={Package}
              accent="bg-amber-500"
            />
            <StatCard
              label="Revenue"
              value={formatCents(stats.totalRevenue)}
              sub="Total earnings"
              icon={DollarSign}
              accent="bg-violet-500"
            />
          </>
        ) : (
          Array.from({ length: 6 }).map((_, i) => <StatSkeleton key={i} />)
        )}
      </div>

      {/* ── Table Card ── */}
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
                {isAllStores
                  ? "Manage and track all incoming orders"
                  : "Orders for this store"}
              </p>
            </div>
            {!isLoading && (
              <Badge
                variant="secondary"
                className="ml-1 tabular-nums text-xs font-semibold"
              >
                {totalCount.toLocaleString()}
              </Badge>
            )}
          </div>

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
        <div className="flex items-center gap-3 px-5 py-2.5 border-b border-border/60 bg-muted/30">
          <PeriodFilter
            preset={periodPreset}
            customRange={customRange}
            onPresetChange={setPeriodPreset}
            onCustomRangeChange={setCustomRange}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
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
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <OrderRowSkeleton key={i} />
                ))
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
                          {isSearchMode
                            ? `Nothing matched "${debouncedSearch}"`
                            : "Orders will appear here once created"}
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
                    onClick={() => handleViewOrder(order.orderId)}
                    className="border-b border-border/40 hover:bg-muted/40 transition-colors duration-100 group cursor-pointer"
                  >
                    <td className="px-5 py-3.5">
                      <code className="text-xs font-semibold text-foreground/70 bg-muted px-2 py-1 rounded-md font-mono tracking-tight">
                        {order.orderRef}
                      </code>
                    </td>
                    {isAllStores && (
                      <td className="px-4 py-3.5">
                        {order.storeId ? (
                          <Link
                            href={`/admin/store/${order.storeId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-2 hover:opacity-75 transition-opacity"
                          >
                            <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center shrink-0">
                              <Store className="w-3 h-3 text-muted-foreground" />
                            </div>
                            <span className="text-sm font-medium text-foreground truncate max-w-27.5">
                              {order.storeName}
                            </span>
                          </Link>
                        ) : (
                          <span className="text-muted-foreground/40 text-sm">
                            —
                          </span>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3.5">
                      <div onClick={(e) => e.stopPropagation()}>
                        <CustomerCell order={order} role={role} />
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {formatDate(order.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-semibold text-foreground tabular-nums">
                        {formatCents(order.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewOrder(order.orderId);
                        }}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        View
                      </Button>
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
              Page{" "}
              <span className="font-medium text-foreground">{currentPage}</span>{" "}
              of{" "}
              <span className="font-medium text-foreground">{totalPages}</span>
            </p>
            <Pagination className="mx-0 w-auto justify-end">
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
                          if (!isLoading) setCurrentPage(page as number);
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
