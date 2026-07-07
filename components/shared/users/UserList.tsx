"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ShoppingCart, Store, Users, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import CustomerCard from "./CustomerCard";
import QrScannerButton from "./QrScannerButton";
import { useRouter } from "next/navigation";
import { SerializedCustomer } from "@/types/customer/customer";
import {
  getStoreCustomers,
  getSearchCustomer,
  getCustomersFiltered,
  getCustomerFilterOptions,
  PaginationMeta,
  CustomerFilters,
} from "@/actions/admin/customers/getCustomers.action";
import { getStores } from "@/actions/store/getStores.actions";
import { StoreDocument } from "@/types/store/store";
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
  CustomerFiltersSheet,
  countActiveCustomerFilters,
} from "@/components/admin/customers/CustomerFilterSheet";
import type { EventParticipantStatus } from "@/db/models/customer/customer.model";

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

const FilterChip = ({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) => (
  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium">
    {label}
    <button
      onClick={onRemove}
      className="hover:text-destructive transition-colors ml-0.5"
    >
      <X className="h-3 w-3" />
    </button>
  </span>
);

type UserListProps = {
  userRole?: "cashier" | "store" | "admin" | "immigration";
  adminMode?: boolean;
  storeId?: string;
  myStoreCustomersData?: SerializedCustomer[];
  initialPagination?: PaginationMeta;
};

const ITEMS_PER_PAGE = 5;
const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;
const EMPTY_FILTERS: CustomerFilters = {};

const getSortableTime = (c: SerializedCustomer) => {
  const t = new Date(c.createdAt).getTime();
  if (Number.isFinite(t) && t > 0) return t;

  const idStr = c._id.toString();

  if (/^[a-fA-F0-9]{24}$/.test(idStr)) {
    return parseInt(idStr.slice(0, 8), 16) * 1000;
  }

  return 0;
};

const UserList = (props: UserListProps) => {
  const isAdminMode = props.adminMode === true;
  const userRole = props.userRole;

  const cashierRole = userRole === "cashier";
  const storeRole = userRole === "store";
  const immigrationRole = userRole === "immigration";

  // Immigration uses store-style customer card behavior
  const customerCardRole = immigrationRole ? "store" : userRole;

  const router = useRouter();

  const storeId = props.storeId;

  // Admin without storeId = all stores
  // Immigration without storeId = all stores
  const isAllStores = (isAdminMode || immigrationRole) && !storeId;

  const [fetchedCustomers, setFetchedCustomers] = useState<
    SerializedCustomer[]
  >((props.myStoreCustomersData || []).slice(0, ITEMS_PER_PAGE));

  const [isLoading, setIsLoading] = useState(
    (isAdminMode || immigrationRole) && !props.myStoreCustomersData,
  );

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [serverPagination, setServerPagination] =
    useState<PaginationMeta | null>(props.initialPagination || null);

  const [debouncedSearch] = useDebounce(search, 500);

  // ── Admin-only filters ──
  const [filters, setFilters] = useState<CustomerFilters>(EMPTY_FILTERS);
  const [stores, setStores] = useState<StoreDocument[]>([]);

  const [eventParticipantOptions, setEventParticipantOptions] = useState<
    EventParticipantStatus[]
  >([]);

  const [cityOptions, setCityOptions] = useState<string[]>([]);

  const isFilterMode = isAdminMode && countActiveCustomerFilters(filters) > 0;

  const searchInputRef = useRef<HTMLInputElement>(null);
  const scanBufferRef = useRef("");

  useEffect(() => {
    setTimeout(() => searchInputRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Load store list + filter dropdown options once, admin only
  useEffect(() => {
    if (!isAdminMode) return;
    getStores()
      .then((res) => {
        if (res.success && res.data) setStores(res.data);
      })
      .catch(console.error);
    getCustomerFilterOptions()
      .then((res) => {
        if (res.success && res.data) {
          setEventParticipantOptions(res.data.eventParticipantOptions);
          setCityOptions(res.data.cityOptions);
        }
      })
      .catch(console.error);
  }, [isAdminMode]);

  useEffect(() => {
    const commitScan = (value: string) => {
      const trimmed = value.trim();
      if (!OBJECT_ID_RE.test(trimmed)) return;

      searchInputRef.current?.blur();
      setSearch(trimmed);
    };

    const accumulate = (chars: string) => {
      scanBufferRef.current += chars;

      if (scanBufferRef.current.length > 24) {
        scanBufferRef.current = scanBufferRef.current.slice(-24);
      }

      if (OBJECT_ID_RE.test(scanBufferRef.current)) {
        const id = scanBufferRef.current;
        scanBufferRef.current = "";
        commitScan(id);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        const buf = scanBufferRef.current;
        scanBufferRef.current = "";

        if (OBJECT_ID_RE.test(buf)) commitScan(buf);
        return;
      }

      if (e.key.length !== 1) return;

      accumulate(e.key);
    };

    const handleCompositionEnd = (e: CompositionEvent) => {
      if (!e.data) return;

      scanBufferRef.current = "";
      accumulate(e.data);
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("compositionend", handleCompositionEnd, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("compositionend", handleCompositionEnd, true);
    };
  }, []);

  const handleScanResult = (scannedId: string) => {
    const trimmed = scannedId.trim();
    if (!OBJECT_ID_RE.test(trimmed)) return;

    searchInputRef.current?.blur();
    setSearch(trimmed);
  };

  const handleApplyFilters = (newFilters: CustomerFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const query = debouncedSearch.trim();

      if (cashierRole && !query) {
        if (mounted) {
          setFetchedCustomers([]);
          setServerPagination(null);
          setIsLoading(false);
        }
        return;
      }

      // Admin path: search + structured filters combined
      if (isAdminMode) {
        setIsLoading(true);
        const result = await getCustomersFiltered(
          query || null,
          page,
          ITEMS_PER_PAGE,
          filters,
        );
        if (!mounted) return;

        if (result.success) {
          setFetchedCustomers(result.data as unknown as SerializedCustomer[]);
          if (result.pagination) setServerPagination(result.pagination);
        } else {
          toast.error(result.error || "Failed to fetch customers");
        }
        setIsLoading(false);
        return;
      }

      if (
        !isAdminMode &&
        !immigrationRole &&
        page === 1 &&
        !query &&
        props.myStoreCustomersData &&
        props.myStoreCustomersData.length > 0
      ) {
        setFetchedCustomers(props.myStoreCustomersData);

        if (props.initialPagination) {
          setServerPagination(props.initialPagination);
        }

        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      const result = query
        ? await getSearchCustomer(query, storeId, page, ITEMS_PER_PAGE)
        : await getStoreCustomers(storeId, page, ITEMS_PER_PAGE);

      if (!mounted) return;

      if (result.success) {
        setFetchedCustomers(result.data as unknown as SerializedCustomer[]);

        if (result.pagination) {
          setServerPagination(result.pagination);
        }

        const isBarcodeScan = cashierRole && OBJECT_ID_RE.test(query);

        if (isBarcodeScan && result.data.length === 1) {
          router.push(`/cashier/customer/${result.data[0]._id}/cart`);
          return;
        }
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
    immigrationRole,
    storeId,
    page,
    debouncedSearch,
    props.myStoreCustomersData,
    props.initialPagination,
    cashierRole,
    router,
    filters.storeId,
    filters.walletMin,
    filters.walletMax,
    filters.referralCodeEnabled,
    filters.placedFirstOrder,
    filters.eventParticipant,
    filters.city,
    filters.hasCartItems,
  ]);

  const displayData = useMemo(() => {
    return [...fetchedCustomers].sort(
      (a, b) => getSortableTime(b) - getSortableTime(a),
    );
  }, [fetchedCustomers]);

  const totalPages = serverPagination ? serverPagination.totalPages : 1;

  const totalCount = serverPagination
    ? serverPagination.totalCount
    : fetchedCustomers.length;

  const heading = isAllStores ? "All Customers" : "Customers";

  const searchPlaceholder = isAllStores
    ? "Search id, name, email, phone or store…"
    : cashierRole || storeRole
      ? "Search id, name or scan QR…"
      : "Search";

  // Build readable chips for active admin filters
  const filterChips: { label: string; clear: () => void }[] = [];

  if (isAdminMode) {
    if (filters.storeId) {
      const storeName =
        stores.find((s) => s._id.toString() === filters.storeId)?.name ??
        "Store";
      filterChips.push({
        label: storeName,
        clear: () => handleApplyFilters({ ...filters, storeId: undefined }),
      });
    }
    if (filters.walletMin !== undefined || filters.walletMax !== undefined) {
      filterChips.push({
        label: `Wallet CA$${((filters.walletMin ?? 0) / 100).toFixed(0)}–CA$${((filters.walletMax ?? 100000) / 100).toFixed(0)}`,
        clear: () =>
          handleApplyFilters({
            ...filters,
            walletMin: undefined,
            walletMax: undefined,
          }),
      });
    }
    if (filters.referralCodeEnabled !== undefined) {
      filterChips.push({
        label: filters.referralCodeEnabled
          ? "Referral Enabled"
          : "Referral Disabled",
        clear: () =>
          handleApplyFilters({ ...filters, referralCodeEnabled: undefined }),
      });
    }
    if (filters.placedFirstOrder !== undefined) {
      filterChips.push({
        label: filters.placedFirstOrder
          ? "Placed 1st Order"
          : "No 1st Order Yet",
        clear: () =>
          handleApplyFilters({ ...filters, placedFirstOrder: undefined }),
      });
    }
    if (filters.hasCartItems !== undefined) {
      filterChips.push({
        label: filters.hasCartItems ? "Has Cart Items" : "Empty / No Cart",
        clear: () =>
          handleApplyFilters({ ...filters, hasCartItems: undefined }),
      });
    }
    if (filters.eventParticipant) {
      filterChips.push({
        label: `Event: ${filters.eventParticipant}`,
        clear: () =>
          handleApplyFilters({ ...filters, eventParticipant: undefined }),
      });
    }
    if (filters.city) {
      filterChips.push({
        label: filters.city,
        clear: () => handleApplyFilters({ ...filters, city: undefined }),
      });
    }
  }

  return (
    <div
      className={`space-y-3 mb-20 sm:mb-0 ${cashierRole ? "px-0 md:px-5" : ""}`}
    >
      <div className="border border-border rounded-xl bg-card">
        <div className="flex items-center justify-between px-3 pt-3 pb-2 sm:px-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground shrink-0" />

            <h1 className="text-base sm:text-lg font-semibold">{heading}</h1>

            {isLoading ? (
              <Skeleton className="h-5 w-10 rounded-full" />
            ) : cashierRole && !debouncedSearch ? null : (
              <Badge variant="secondary" className="text-xs tabular-nums">
                {totalCount} Customers
              </Badge>
            )}
          </div>
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
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
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

          {isAdminMode && (
            <CustomerFiltersSheet
              filters={filters}
              onApply={handleApplyFilters}
              stores={stores}
              eventParticipantOptions={eventParticipantOptions}
              cityOptions={cityOptions}
            />
          )}
        </div>

        {isAdminMode && filterChips.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center px-3 pb-3 sm:px-4">
            {filterChips.map((chip) => (
              <FilterChip
                key={chip.label}
                label={chip.label}
                onRemove={chip.clear}
              />
            ))}
            <button
              onClick={() => handleApplyFilters(EMPTY_FILTERS)}
              className="text-xs font-medium text-muted-foreground hover:text-destructive transition-colors underline underline-offset-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <CustomerCardSkeleton key={i} />
          ))}
        </div>
      ) : cashierRole && !debouncedSearch ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <Search className="w-10 h-10 opacity-20" />

          <p className="text-sm">
            Search for a customer by name, ID, or scan a QR code to begin.
          </p>
        </div>
      ) : displayData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <Users className="w-10 h-10 opacity-20" />

          <p className="text-sm">
            {search || isFilterMode
              ? "No customers match your search/filters"
              : "No customers yet"}
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
          {!search && isFilterMode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleApplyFilters(EMPTY_FILTERS)}
              type="button"
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {displayData.map((customer) => (
              <div
                key={customer._id.toString()}
                className={`flex flex-col gap-0 ${
                  cashierRole || isAdminMode ? "hover:cursor-pointer" : ""
                }`}
                onClick={() => {
                  if (cashierRole) {
                    router.push(`/cashier/customer/${customer._id}/cart`);
                  }

                  if (isAdminMode) {
                    router.push(`/admin/customers/${customer._id}`);
                  }
                }}
              >
                <div className="flex items-center gap-1.5 self-start mb-1.5 flex-wrap">
                  {isAllStores &&
                    customer.associatedStoreId &&
                    (isAdminMode ? (
                      <Link
                        href={`/admin/store/${customer.associatedStoreId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-colors"
                      >
                        <Store className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="text-xs font-semibold text-emerald-700 truncate max-w-40 group-hover:underline underline-offset-2">
                          {customer.storeName ?? "Unknown Store"}
                        </span>
                      </Link>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100">
                        <Store className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="text-xs font-semibold text-emerald-700 truncate max-w-40">
                          {customer.storeName ?? "Unknown Store"}
                        </span>
                      </div>
                    ))}

                  {isAdminMode && (customer as any).hasCartItems && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 border border-amber-100">
                      <ShoppingCart className="w-3 h-3 text-amber-500 shrink-0" />
                      <span className="text-xs font-semibold text-amber-700">
                        In Cart
                      </span>
                    </div>
                  )}
                </div>

                <CustomerCard customer={customer} userRole={customerCardRole} />
              </div>
            ))}
          </div>

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

                        if (page > 1) {
                          setPage((p) => p - 1);
                        }
                      }}
                      className={
                        page <= 1 ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>

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

                        if (page < totalPages) {
                          setPage((p) => p + 1);
                        }
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
