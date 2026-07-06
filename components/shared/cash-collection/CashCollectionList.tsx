"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Banknote, Wallet, Store, User } from "lucide-react";
import Link from "next/link";
import { type DateRange } from "react-day-picker";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DatePickerWithRange } from "@/components/admin/analytics/reciept/DatePickerWithRange";
import {
  getCashActivitiesPaginated,
  getCashSummary,
  type CashActivity,
  type CashSummary,
} from "@/actions/common/getCashActivities.action";
import { getStores } from "@/actions/store/getStores.actions";
import { StoreDocument } from "@/types/store/store";
import { getVancouverDayBoundsUTC } from "@/lib/timezone";

// ─── Helpers ───────────────────────────────────────────────────────────────────

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
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Converts a raw calendar DateRange (browser-local Y/M/D) into the
// correct Vancouver-day UTC bounds for querying Mongo.
function toVancouverBounds(range: DateRange | undefined): {
  start?: Date;
  end?: Date;
} {
  if (!range?.from) return {};
  const start = getVancouverDayBoundsUTC(range.from).start;
  // If the user only picked a single day (no `to` yet), treat it as a one-day range.
  const end = getVancouverDayBoundsUTC(range.to ?? range.from).end;
  return { start, end };
}

// ─── Skeletons ─────────────────────────────────────────────────────────────────

const RowSkeleton = () => (
  <tr className="border-b border-gray-50">
    {[32, 28, 28, 16, 16, 16, 20].map((w, i) => (
      <td key={i} className="px-4 py-3.5">
        <Skeleton className={`h-5 w-${w} rounded-md`} />
      </td>
    ))}
  </tr>
);

const SummarySkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-7 w-20" />
    <Skeleton className="h-3 w-16" />
  </div>
);

// ─── Props ─────────────────────────────────────────────────────────────────────

interface CashCollectionListProps {
  storeId?: string;
  role?: "admin" | "store";
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function CashCollectionList({
  storeId,
  role = "admin",
}: CashCollectionListProps) {
  const [activities, setActivities] = useState<CashActivity[]>([]);
  const [summary, setSummary] = useState<CashSummary | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // ── Filters ──
  const [selectedStoreId, setSelectedStoreId] = useState<string>(
    storeId || "all",
  );
  const [stores, setStores] = useState<StoreDocument[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const isAdmin = role === "admin";
  const effectiveStoreId = isAdmin
    ? selectedStoreId === "all"
      ? undefined
      : selectedStoreId
    : storeId;
  const isAllStores = !effectiveStoreId;

  // Vancouver-correct UTC bounds derived from the raw picker selection.
  // Recomputed only when the picker actually changes.
  const { start: rangeStart, end: rangeEnd } = toVancouverBounds(dateRange);

  // Load store list once, admin only
  useEffect(() => {
    if (!isAdmin) return;
    getStores()
      .then((res) => {
        if (res.success && res.data) setStores(res.data);
      })
      .catch(console.error);
  }, [isAdmin]);

  // Auto-scroll to top whenever the page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const selectedStoreName =
    selectedStoreId === "all"
      ? "All Stores (Global)"
      : stores.find((s) => s._id.toString() === selectedStoreId)?.name ||
        "Select a store";

  // Load summary — re-runs whenever a filter changes
  useEffect(() => {
    getCashSummary(effectiveStoreId, rangeStart, rangeEnd)
      .then(setSummary)
      .catch(console.error);
    // rangeStart/rangeEnd are Date objects recreated each render, so key off
    // the picker's own from/to instead to avoid an infinite effect loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveStoreId, dateRange?.from, dateRange?.to]);

  // Load activities — re-runs whenever a filter or the page changes
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      const res = await getCashActivitiesPaginated(
        effectiveStoreId,
        currentPage,
        8,
        rangeStart,
        rangeEnd,
      );
      if (!mounted) return;
      if (res.success) {
        setActivities(res.data);
        setTotalPages(res.totalPages);
        setTotalCount(res.totalCount);
      } else {
        toast.error(res.error || "Failed to load cash activities");
      }
      setIsLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
    // Same reasoning as above — key off the picker's raw from/to.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveStoreId, dateRange?.from, dateRange?.to, currentPage]);

  const handleStoreChange = (newStoreId: string) => {
    setSelectedStoreId(newStoreId);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setCurrentPage(1);
  };

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

  const columnCount = isAllStores ? 7 : 6;

  return (
    <div className="space-y-5">
      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-end">
        {isAdmin && (
          <div className="space-y-2.5 w-full sm:w-64">
            <Label className="text-sm font-medium">Select Store</Label>
            <Select value={selectedStoreId} onValueChange={handleStoreChange}>
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="Select Store">
                  {selectedStoreName}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores (Global)</SelectItem>
                {stores.map((store) => (
                  <SelectItem
                    key={store._id.toString()}
                    value={store._id.toString()}
                  >
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2.5 w-full sm:w-auto">
          <Label className="text-sm font-medium">Date Range</Label>
          <DatePickerWithRange
            date={dateRange}
            setDate={handleDateRangeChange}
          />
        </div>
      </div>

      {/* ── Summary cards ──────────────────────────────────────────────────── */}
      {summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
          {[
            {
              label: "Total Collected",
              value: formatCents(summary.totalCashCollected),
              bg: "bg-amber-50/60",
              border: "border-amber-100",
              icon: Banknote,
            },
            {
              label: "Cash Top-Ups",
              value: summary.totalCashTopUps.toLocaleString(),
              bg: "bg-blue-50/60",
              border: "border-blue-100",
              icon: Wallet,
            },
          ].map((c) => (
            <div
              key={c.label}
              className={`${c.bg} border ${c.border} rounded-2xl p-4`}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs text-gray-500 font-medium leading-snug">
                  {c.label}
                </p>
                <c.icon className="w-4 h-4 text-gray-400 shrink-0" />
              </div>
              <p className="text-xl font-bold text-gray-900 tracking-tight">
                {c.value}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
          {Array.from({ length: 2 }).map((_, i) => (
            <SummarySkeleton key={i} />
          ))}
        </div>
      )}

      {/* ── Table card ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 pt-5 pb-4 border-b border-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="bg-amber-50 p-1.5 rounded-lg">
              <Banknote className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">
                {isAllStores
                  ? "All cash activities across every store"
                  : "Cash activities for this store"}
              </p>
            </div>
            {!isLoading && (
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full tabular-nums">
                {totalCount.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[780px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Cashier
                </th>
                {isAllStores && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Store
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Cash Paid
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Cash Due
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} />)
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan={columnCount} className="py-16 text-center">
                    <Banknote className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400 font-medium">
                      No cash activities found
                    </p>
                  </td>
                </tr>
              ) : (
                activities.map((a) => (
                  <tr
                    key={`${a.id}`}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Customer */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                        <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                          {a.customerName}
                        </span>
                      </div>
                    </td>

                    {/* Cashier */}
                    <td className="px-4 py-3.5 text-sm text-gray-600 truncate max-w-[100px]">
                      {a.cashierName}
                    </td>

                    {/* Store — admin all-stores only */}
                    {isAllStores && (
                      <td className="px-4 py-3.5">
                        {a.storeId ? (
                          <Link
                            href={`/admin/store/${a.storeId}`}
                            className="inline-flex items-center gap-1.5 text-sm text-gray-700 hover:text-emerald-700 transition-colors group/s"
                          >
                            <Store className="w-3.5 h-3.5 text-gray-300 group-hover/s:text-emerald-500 shrink-0" />
                            <span className="truncate max-w-[100px] hover:underline underline-offset-2">
                              {a.storeName}
                            </span>
                          </Link>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    )}

                    {/* Amount */}
                    <td className="px-4 py-3.5 font-bold text-gray-900 tabular-nums">
                      {formatCents(a.amount)}
                    </td>

                    {/* Cash Paid */}
                    <td className="px-4 py-3.5 text-gray-600 tabular-nums">
                      {formatCents(a.cashPaid)}
                    </td>

                    {/* Cash Due */}
                    <td className="px-4 py-3.5 tabular-nums">
                      <span
                        className={
                          a.cashDue > 0
                            ? "text-amber-600 font-medium"
                            : "text-gray-600"
                        }
                      >
                        {formatCents(a.cashDue)}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 text-xs text-gray-400">
                      {formatDate(a.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
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
