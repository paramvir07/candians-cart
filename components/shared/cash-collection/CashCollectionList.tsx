"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Search,
  Banknote,
  ShoppingCart,
  Wallet,
  Store,
  User,
  Filter,
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
import {
  getCashActivitiesPaginated,
  getCashSummary,
  type CashActivity,
  type CashSummary,
} from "@/actions/common/getCashActivities.action";

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

// ─── Skeletons ─────────────────────────────────────────────────────────────────

const RowSkeleton = () => (
  <tr className="border-b border-gray-50">
    {[32, 28, 28, 16, 24, 20].map((w, i) => (
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

// ─── Type filter ───────────────────────────────────────────────────────────────

type TypeFilter = "all" | "order" | "wallet_topup";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface CashCollectionListProps {
  /** Pass storeId to scope to one store. Omit for all stores (admin global). */
  storeId?: string;
  /** "admin" → show store column + store links. "store" → hide store column. */
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
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const isAllStores = !storeId;

  // Load summary once
  useEffect(() => {
    getCashSummary(storeId).then(setSummary).catch(console.error);
  }, [storeId]);

  // Load activities
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      const res = await getCashActivitiesPaginated(
        storeId,
        currentPage,
        15,
        typeFilter,
        searchQuery,
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
  }, [storeId, currentPage, typeFilter, searchQuery]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setCurrentPage(1), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

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

  const TYPE_FILTERS: { label: string; value: TypeFilter }[] = [
    { label: "All", value: "all" },
    { label: "Orders", value: "order" },
    { label: "Top-Ups", value: "wallet_topup" },
  ];

  return (
    <div className="space-y-5">
      {/* ── Summary cards ──────────────────────────────────────────────────── */}
      {summary ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            {
              label: "Total Collected",
              value: formatCents(summary.totalCashCollected),
              bg: "bg-amber-50/60",
              border: "border-amber-100",
              icon: Banknote,
            },
            {
              label: "Cash Orders",
              value: summary.totalCashOrders.toLocaleString(),
              bg: "bg-emerald-50/60",
              border: "border-emerald-100",
              icon: ShoppingCart,
            },
            {
              label: "Order Revenue",
              value: formatCents(summary.totalCashOrderAmount),
              bg: "bg-emerald-50/60",
              border: "border-emerald-100",
              icon: ShoppingCart,
            },
            {
              label: "Cash Top-Ups",
              value: summary.totalCashTopUps.toLocaleString(),
              bg: "bg-blue-50/60",
              border: "border-blue-100",
              icon: Wallet,
            },
            {
              label: "Top-Up Revenue",
              value: formatCents(summary.totalCashTopUpAmount),
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
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
              <h1 className="text-lg font-bold text-gray-900">
                Cash Collection
              </h1>
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
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search customer, cashier or store..."
              className="pl-10 rounded-xl h-9 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-50 bg-gray-50/40">
          <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="text-xs text-gray-400 font-medium mr-1">Type:</span>
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                typeFilter === f.value
                  ? "bg-amber-500 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-600"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/30">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Type
                </th>
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
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} />)
              ) : activities.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAllStores ? 6 : 5}
                    className="py-16 text-center"
                  >
                    <Banknote className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400 font-medium">
                      No cash activities found
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-xs text-emerald-600 underline underline-offset-2 mt-1"
                      >
                        Clear search
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                activities.map((a) => (
                  <tr
                    key={`${a.type}-${a.id}`}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Type badge */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          a.type === "order"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {a.type === "order" ? (
                          <ShoppingCart className="w-3 h-3" />
                        ) : (
                          <Wallet className="w-3 h-3" />
                        )}
                        {a.label}
                      </span>
                    </td>

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
