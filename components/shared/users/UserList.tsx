"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Search, Store, Users, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import CustomerCard from "./CustomerCard";
import QrScannerButton from "./QrScannerButton";
import { useRouter } from "next/navigation";
import { Customer } from "@/types/customer/customer";
import {
  getStoreCustomers,
  getSearchCustomer,
  PaginationMeta,
} from "@/actions/admin/customers/getCustomers.action";
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

type SortOrder = "newest" | "oldest";

const CustomerCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3 animate-pulse">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
      <div className="space-y-1.5 flex-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-2/3" />
  </div>
);

type AnyCustomer = {
  _id: string | { toString(): string };
  name: string;
  email: string;
  mobile: string;
  walletBalance?: number;
  associatedStoreId?: string;
  storeName?: string;
  createdAt?: any;
  [key: string]: any;
};

type UserListProps = {
  userRole?: "cashier" | "store" | "admin";
  adminMode?: boolean;
  storeId?: string;
  myStoreCustomersData?: Customer[];
  initialPagination?: PaginationMeta;
};

const ITEMS_PER_PAGE = 12;

const UserList = (props: UserListProps) => {
  const isAdminMode = props.adminMode === true;
  const userRole = props.userRole;
  const cashierRole = userRole === "cashier";
  const storeRole = userRole === "store";
  const router = useRouter();

  const storeId = props.storeId;
  const isAllStores = isAdminMode && !storeId;

  // ── State ───────────────────────────────────────────────────────────────────
  const [fetchedCustomers, setFetchedCustomers] = useState<AnyCustomer[]>(
    (props.myStoreCustomersData as unknown as AnyCustomer[])?.slice(
      0,
      ITEMS_PER_PAGE,
    ) || [],
  );

  const [isLoading, setIsLoading] = useState(
    isAdminMode && !props.myStoreCustomersData,
  );
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [page, setPage] = useState(1);

  const [serverPagination, setServerPagination] =
    useState<PaginationMeta | null>(props.initialPagination || null);

  // ── Package Hook ────────────────────────────────────────────────────────────
  const [debouncedSearch] = useDebounce(search, 500);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const scanBufferRef = useRef("");
  const lastKeyTimeRef = useRef(0);

  // Reset to page 1 when the debounced search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // QR Scanner Keydown Listener
  useEffect(() => {
    const THRESHOLD = 50;
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      const gap = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (e.key === "Enter") {
        const buf = scanBufferRef.current;
        scanBufferRef.current = "";

        if (buf.length >= 6) {
          e.preventDefault();
          e.stopPropagation();
          searchInputRef.current?.focus();
          setSearch(buf);
          setTimeout(() => searchInputRef.current?.select(), 0);
        }
        return;
      }
      if (e.key.length !== 1) return;
      if (gap > THRESHOLD) scanBufferRef.current = "";
      scanBufferRef.current += e.key;
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, []);

  // ── Unified Server Fetch (For Admins AND Cashiers) ─────────────────────────
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      // 🚀 THE FIX: Use the actual initialPagination prop instead of array length math.
      if (
        !isAdminMode &&
        page === 1 &&
        !debouncedSearch &&
        props.myStoreCustomersData &&
        props.myStoreCustomersData.length > 0
      ) {
        setFetchedCustomers(
          props.myStoreCustomersData as unknown as AnyCustomer[],
        );

        // Use the REAL pagination data from the server, which has the true totalCount
        if (props.initialPagination) {
          setServerPagination(props.initialPagination);
        }

        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      const query = debouncedSearch.trim();
      const result = query
        ? await getSearchCustomer(query, storeId, page, ITEMS_PER_PAGE)
        : await getStoreCustomers(storeId, page, ITEMS_PER_PAGE);

      if (!mounted) return;

      if (result.success) {
        setFetchedCustomers(result.data as AnyCustomer[]);
        if (result.pagination) setServerPagination(result.pagination);
      } else {
        toast.error(result.error || "Failed to fetch customers");
      }
      setIsLoading(false);
    };

    load();
    return () => {
      mounted = false;
    };
  }, [
    isAdminMode,
    storeId,
    page,
    debouncedSearch,
    props.myStoreCustomersData,
    props.initialPagination,
  ]);

  // ── Sort ───────────────────────────────────────────────────────────
  const getSortableTime = (c: AnyCustomer) => {
    const t = new Date(c.createdAt).getTime();
    if (Number.isFinite(t) && t > 0) return t;
    const idStr = c._id?.toString?.() ?? "";
    if (/^[a-fA-F0-9]{24}$/.test(idStr))
      return parseInt(idStr.slice(0, 8), 16) * 1000;
    return 0;
  };

  const displayData = useMemo(() => {
    return [...fetchedCustomers].sort((a, b) =>
      sortOrder === "newest"
        ? getSortableTime(b) - getSortableTime(a)
        : getSortableTime(a) - getSortableTime(b),
    );
  }, [fetchedCustomers, sortOrder]);

  const totalPages = serverPagination ? serverPagination.totalPages : 1;
  const totalCount = serverPagination
    ? serverPagination.totalCount
    : fetchedCustomers.length;

  const handleScanResult = (scannedId: string) => setSearch(scannedId);

  // ── Heading ─────────────────────────────────────────────────────────────────
  const heading = isAllStores ? "All Customers" : "Customer List";
  const searchPlaceholder = isAllStores
    ? "Search id, name, email, phone or store…"
    : cashierRole || storeRole
      ? "Search id, name or scan QR…"
      : "Search";

  return (
    <div
      className={`space-y-3 mb-20 sm:mb-0 ${cashierRole ? "px-0 md:px-5" : ""}`}
    >
      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="border border-border rounded-xl bg-card">
        <div className="flex items-center justify-between px-3 pt-3 pb-2 sm:px-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground shrink-0" />
            <h1 className="text-base sm:text-lg font-semibold">{heading}</h1>
            {isLoading ? (
              <Skeleton className="h-5 w-10 rounded-full" />
            ) : (
              <Badge variant="secondary" className="text-xs tabular-nums">
                {totalCount} Customers
              </Badge>
            )}
          </div>

          <Button
            variant={sortOrder === "oldest" ? "default" : "secondary"}
            size="sm"
            className="gap-1.5 text-xs h-8 px-2.5 shrink-0"
            onClick={() =>
              setSortOrder((p) => (p === "newest" ? "oldest" : "newest"))
            }
            type="button"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>{sortOrder === "newest" ? "Newest" : "Oldest"}</span>
          </Button>
        </div>

        <div className="flex items-center gap-2 px-3 pb-3 sm:px-4">
          <div className="flex items-center flex-1 min-w-0 gap-2">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="relative flex-1 bg-accent/70 rounded-xl">
              <Input
                ref={searchInputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl border-0 bg-transparent focus-visible:ring-1 text-sm h-9 pr-9"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  type="button"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          {!isAllStores && <QrScannerButton onScan={handleScanResult} />}
        </div>
      </div>

      {/* ── Grid ────────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <CustomerCardSkeleton key={i} />
          ))}
        </div>
      ) : displayData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <Users className="w-10 h-10 opacity-20" />
          <p className="text-sm">
            {search ? "No customers match your search" : "No customers yet"}
          </p>
          {search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearch("")}
              type="button"
            >
              Clear search
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {displayData.map((customer) => (
              <div
                key={customer._id.toString()}
                className={`flex flex-col gap-0 ${cashierRole || isAdminMode ? "hover:cursor-pointer" : ""}`}
                onClick={() => {
                  if (cashierRole)
                    router.push(`/cashier/customer/${customer._id}`);
                  if (isAdminMode)
                    router.push(`/admin/customers/${customer._id}`);
                }}
              >
                {isAllStores && customer.associatedStoreId && (
                  <Link
                    href={`/admin/store/${customer.associatedStoreId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="group inline-flex items-center gap-1.5 self-start mb-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-colors"
                  >
                    <Store className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span className="text-xs font-semibold text-emerald-700 truncate max-w-[160px] group-hover:underline underline-offset-2">
                      {customer.storeName ?? "Unknown Store"}
                    </span>
                  </Link>
                )}
                <CustomerCard customer={customer as any} userRole={userRole} />
              </div>
            ))}
          </div>

          {/* ── Shadcn Pagination ────────────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 pb-6 border-t border-border mt-4 gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline-block">
                Showing {displayData.length} of {totalCount} customers
              </span>

              <Pagination className="w-auto mx-0 sm:mx-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) setPage((p) => p - 1);
                      }}
                      className={
                        page <= 1 ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>

                  {/* Dynamic Ellipsis Logic */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                    )
                    .map((p, index, array) => (
                      <div key={p} className="flex items-center">
                        {index > 0 && p - array[index - 1] > 1 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            isActive={page === p}
                            onClick={(e) => {
                              e.preventDefault();
                              setPage(p);
                            }}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      </div>
                    ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < totalPages) setPage((p) => p + 1);
                      }}
                      className={
                        page >= totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserList;
