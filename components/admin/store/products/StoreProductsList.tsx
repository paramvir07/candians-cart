"use client";

import { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, PackageOpen, CirclePlus, Store, X } from "lucide-react";
import Link from "next/link";
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
import { ProductCard, ProductCardRole } from "./ProductCard";
import { IProduct } from "@/types/store/products.types";
import { Button } from "@/components/ui/button";

// Server Actions
import {
  AdminProduct,
  getStoreProductsPaginated,
} from "@/actions/admin/products/getProducts.action";
import { searchProductsByUPC } from "@/actions/common/searchProducts.action";
import {
  getStoreProductsFiltered,
  ProductFilters,
  searchProductsWithFilters,
} from "@/actions/admin/products/getProductsFiltered.action";

// UI Components
import QrScannerButton from "@/components/shared/users/QrScannerButton";
import { ProductFiltersSheet } from "@/components/shared/filters/ProductFilterSheet";

const ProductCardSkeleton = () => (
  <div className="bg-card rounded-2xl border border-border shadow-sm flex flex-col overflow-hidden">
    <Skeleton className="w-full aspect-4/3 rounded-none" />
    <div className="p-4 flex flex-col gap-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="pt-3 border-t border-border flex justify-between items-end">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-7 w-24" />
        </div>
        <Skeleton className="h-5 w-14 rounded-md" />
      </div>
    </div>
    <div className="px-4 pb-4 grid grid-cols-2 gap-2">
      <Skeleton className="h-9 rounded-xl" />
      <Skeleton className="h-9 rounded-xl" />
    </div>
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

interface StoreProductsListProps {
  storeId?: string;
  role: ProductCardRole;
}

const EMPTY_FILTERS: ProductFilters = {};

const hasFilters = (f: ProductFilters) =>
  (f.categories?.length ?? 0) > 0 ||
  f.minPrice !== undefined ||
  f.maxPrice !== undefined ||
  f.subsidised !== undefined ||
  f.subsidyLevel !== undefined ||
  f.inStock !== undefined ||
  (f.taxRates?.length ?? 0) > 0 ||
  f.markupMin !== undefined ||
  f.markupMax !== undefined ||
  (f.sortBy !== undefined && f.sortBy !== "recommended");

export const StoreProductsList = ({
  storeId,
  role,
}: StoreProductsListProps) => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [upcMode, setUpcMode] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const scanBufferRef = useRef("");
  const lastKeyTimeRef = useRef(0);
  const androidBufferRef = useRef("");
  const androidTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const androidLastInputRef = useRef(0);

  // VERCEL BEST PRACTICE: Use useDebounce to manage rapid user input
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery] = useDebounce(searchQuery, 350);

  const [filters, setFilters] = useState<ProductFilters>(EMPTY_FILTERS);

  // Derived state (no need for useState here, preventing desync bugs)
  const isAllStores = !storeId;
  const isFilterMode = hasFilters(filters);
  const isSearchMode = debouncedQuery.trim().length > 0;

  // keyboard scanner effect
  useEffect(() => {
    if (!upcMode) return;

    const HUMAN_THRESHOLD_MS = 100;
    const COMMIT_TIMEOUT_MS = 100;

    const commitScan = (value: string) => {
      if (!value || value.length < 4) return;
      setSearchQuery(value);
      searchInputRef.current?.focus();
      setTimeout(() => searchInputRef.current?.select(), 0);
    };

    const flush = () => {
      const buf = scanBufferRef.current;
      scanBufferRef.current = "";
      if (buf.length >= 4) commitScan(buf);
    };

    const resetTimer = () => {
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
      scanTimerRef.current = setTimeout(flush, COMMIT_TIMEOUT_MS);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.length !== 1 && e.key !== "Enter") return;

      const now = Date.now();
      const gap = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (e.key === "Enter") {
        if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
        const buf = scanBufferRef.current;
        scanBufferRef.current = "";
        if (buf.length >= 4) {
          e.preventDefault();
          e.stopPropagation();
          commitScan(buf);
        }
        return;
      }

      if (gap > HUMAN_THRESHOLD_MS && scanBufferRef.current.length > 0) {
        scanBufferRef.current = "";
      }

      scanBufferRef.current += e.key;
      resetTimer();
    };

    const handleCompositionEnd = (e: CompositionEvent) => {
      if (!e.data || e.data.length < 4) return;
      scanBufferRef.current = "";
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
      const value = e.data;
      setSearchQuery(value);
      searchInputRef.current?.focus();
      setTimeout(() => searchInputRef.current?.select(), 0);
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("compositionend", handleCompositionEnd, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("compositionend", handleCompositionEnd, true);
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
    };
  }, [upcMode]);

  // Android scanner effect
  useEffect(() => {
    if (!upcMode) return;
    const input = searchInputRef.current;
    if (!input) return;

    const ANDROID_DEBOUNCE_MS = 150;

    const handleInput = (e: Event) => {
      const inputEvent = e as InputEvent;
      if (inputEvent.isComposing) return; // compositionend handles it

      const val = (e.target as HTMLInputElement).value;
      const now = Date.now();
      const gap = now - androidLastInputRef.current;
      androidLastInputRef.current = now;

      if (gap > ANDROID_DEBOUNCE_MS * 2) {
        androidBufferRef.current = "";
      }

      androidBufferRef.current = val;

      if (androidTimerRef.current) clearTimeout(androidTimerRef.current);

      androidTimerRef.current = setTimeout(() => {
        const buf = androidBufferRef.current;
        androidBufferRef.current = "";
        if (buf.length >= 4) {
          setSearchQuery(buf);
          setTimeout(() => input.select(), 0);
        }
      }, ANDROID_DEBOUNCE_MS);
    };

    input.addEventListener("input", handleInput);
    return () => {
      input.removeEventListener("input", handleInput);
      if (androidTimerRef.current) clearTimeout(androidTimerRef.current);
    };
  }, [upcMode]);

  // Reset to page 1 when a new search begins
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery]);

  // MASTER FETCHER: A single, clean useEffect to prevent race conditions
  useEffect(() => {
    let mounted = true;

    const fetchProducts = async () => {
      setIsLoading(true);

      try {
        // Enforce strict typing from the server actions
        let res: {
          success: boolean;
          data?: AdminProduct[] | any; // 'any' safely catches the ProductActionResponse interface mismatch if strict types differ
          totalPages?: number;
          error?: string;
        };

        if (isSearchMode && isFilterMode) {
          res = await searchProductsWithFilters(
            debouncedQuery,
            storeId,
            currentPage,
            12,
            filters,
          );
        } else if (isSearchMode) {
          res = upcMode
            ? await searchProductsByUPC(debouncedQuery, storeId)
            : await searchProductsWithFilters(
                debouncedQuery,
                storeId,
                currentPage,
                12,
                {},
              );
        } else if (isFilterMode) {
          res = await getStoreProductsFiltered(
            storeId,
            currentPage,
            12,
            filters,
          );
        } else {
          res = await getStoreProductsPaginated(storeId, currentPage, 12);
        }

        // Prevent state updates if the component unmounted during the fetch
        if (!mounted) return;

        if (res.success) {
          setProducts(res.data || []);
          // Standard search doesn't paginate, so fallback to 1
          setTotalPages(res.totalPages ?? 1);
        } else {
          toast.error(
            res.error || "Failed to fetch products in Candian's Cart",
          );
        }
      } catch (error) {
        if (mounted) {
          console.error("Fetch error:", error);
          toast.error("An unexpected error occurred during fetch.");
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchProducts();

    return () => {
      mounted = false;
    };
  }, [
    storeId,
    currentPage,
    filters,
    debouncedQuery,
    isSearchMode,
    isFilterMode,
    upcMode,
  ]);

  const handleBarcodeScan = (value: string) => {
    setSearchQuery(value);
  };

  const handleApplyFilters = (newFilters: ProductFilters) => {
    setFilters(newFilters);
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

  const titles: Record<ProductCardRole, { heading: string; sub: string }> = {
    admin: {
      heading: "Inventory",
      sub: isAllStores
        ? "All products across every store."
        : "Manage products, pricing, subsidies and stock.",
    },
    store: {
      heading: "My Products",
      sub: "View and manage your store's product listings.",
    },
    customer: { heading: "Products", sub: "Browse available products." },
  };

  const addProductHref =
    role === "store"
      ? "/store/products/add"
      : role === "admin" && storeId
        ? `/admin/store/${storeId}/products/add`
        : "";

  // Build readable chips for active filters
  const filterChips: { label: string; clear: () => void }[] = [];

  if ((filters.categories?.length ?? 0) > 0) {
    filters.categories!.forEach((cat) =>
      filterChips.push({
        label: cat,
        clear: () =>
          handleApplyFilters({
            ...filters,
            categories: filters.categories!.filter((c) => c !== cat),
          }),
      }),
    );
  }
  if (filters.inStock) {
    filterChips.push({
      label: "In stock",
      clear: () => handleApplyFilters({ ...filters, inStock: undefined }),
    });
  }
  if (filters.subsidised) {
    filterChips.push({
      label: "Subsidised",
      clear: () => handleApplyFilters({ ...filters, subsidised: undefined }),
    });
  }

  if (filters.subsidyLevel) {
    const subsidyLabels = {
      high: "High Subsidy",
      medium: "Medium Subsidy",
      low: "Low Subsidy",
    };
    filterChips.push({
      label: subsidyLabels[filters.subsidyLevel],
      clear: () => handleApplyFilters({ ...filters, subsidyLevel: undefined }),
    });
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    filterChips.push({
      label: `CA$${((filters.minPrice ?? 0) / 100).toFixed(0)}–CA$${((filters.maxPrice ?? 500000) / 100).toFixed(0)}`,
      clear: () =>
        handleApplyFilters({
          ...filters,
          minPrice: undefined,
          maxPrice: undefined,
        }),
    });
  }
  if ((filters.taxRates?.length ?? 0) > 0) {
    filterChips.push({
      label: `Tax: ${filters.taxRates!.map((r) => `${(r * 100).toFixed(0)}%`).join(", ")}`,
      clear: () => handleApplyFilters({ ...filters, taxRates: undefined }),
    });
  }
  if (filters.markupMin !== undefined || filters.markupMax !== undefined) {
    filterChips.push({
      label: `Markup ${filters.markupMin ?? 0}–${filters.markupMax ?? 100}%`,
      clear: () =>
        handleApplyFilters({
          ...filters,
          markupMin: undefined,
          markupMax: undefined,
        }),
    });
  }
  if (filters.sortBy && filters.sortBy !== "recommended") {
    filterChips.push({
      label:
        {
          price_asc: "Price ↑",
          price_desc: "Price ↓",
          name_asc: "A → Z",
          markup_desc: "Subsidy: High → Low",
          markup_asc: "Subsidy: Low → High",
        }[filters.sortBy] ?? "",
      clear: () => handleApplyFilters({ ...filters, sortBy: undefined }),
    });
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {titles[role].heading}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isSearchMode
              ? `Showing results for "${debouncedQuery}"`
              : isFilterMode
                ? `Filtered results`
                : titles[role].sub}
          </p>
        </div>
        <div className="relative flex gap-2 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          {/* <Input
          ref={searchInputRef}
            type="text"
            placeholder="Search products..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          /> */}
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search products..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <QrScannerButton usedFor="barcode" onScan={handleBarcodeScan} />
          <button
            onClick={() => setUpcMode((v) => !v)}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold border transition-all shrink-0 ${
              upcMode
                ? "bg-green-600 text-white border-green-600"
                : "bg-card text-muted-foreground border-border/60 hover:border-green-300 hover:text-green-700"
            }`}
          >
            <span
              className={`w-1 h-1 rounded-full shrink-0 ${upcMode ? "bg-white" : "bg-muted-foreground/40"}`}
            />
            UPC
          </button>
          {role !== "customer" && (
            <ProductFiltersSheet
              filters={filters}
              onApply={handleApplyFilters}
              role={role}
              storeId={storeId}
            />
          )}
        </div>
      </div>

      {filterChips.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
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

      {(role === "store" || (role === "admin" && storeId)) && (
        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border">
          <p className="text-sm font-medium text-slate-600">
            Want to add a new product?
          </p>
          <Button asChild>
            <Link href={addProductHref} className="flex items-center gap-2">
              <CirclePlus className="h-4 w-4" />
              Add product
            </Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))
        ) : products.length > 0 ? (
          products.map((product) => (
            <div key={product._id} className="flex flex-col gap-0">
              {isAllStores && product.storeId && (
                <Link
                  href={`/admin/store/${product.storeId}`}
                  className="group inline-flex items-center gap-1.5 self-start mb-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-colors"
                >
                  <Store className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span className="text-xs font-semibold text-emerald-700 truncate max-w-40 group-hover:underline underline-offset-2">
                    {product.storeName ?? "Unknown Store"}
                  </span>
                </Link>
              )}
              <ProductCard
                product={product as unknown as IProduct}
                role={role}
                onDelete={(id) =>
                  setProducts((prev) => prev.filter((p) => p._id !== id))
                }
              />
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-2xl bg-muted/20">
            <PackageOpen className="h-12 w-12 mb-3 opacity-25" />
            <p className="font-medium">
              {isSearchMode
                ? "No products matched your search."
                : isFilterMode
                  ? "No products matched your filters."
                  : "No products yet."}
            </p>
            {isSearchMode && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 text-sm text-primary underline underline-offset-2"
              >
                Clear search
              </button>
            )}
            {isFilterMode && !isSearchMode && (
              <button
                onClick={() => handleApplyFilters(EMPTY_FILTERS)}
                className="mt-2 text-sm text-primary underline underline-offset-2"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {!isSearchMode && totalPages > 1 && (
        <div className="pt-4 border-t border-border">
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
    </>
  );
};
