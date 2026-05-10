"use client";
// components/customer/products/ProductsSection.tsx

import { useState, useRef, useEffect } from "react";
import useSWR from "swr";
import { CustomerProductCard } from "@/components/customer/products/CustomerProductCard";
import { getCartQuantities } from "@/actions/customer/ProductAndStore/Cart.Action";
import {
  getCachedStoreProducts,
  PaginatedProductsResponse,
} from "@/actions/cache/product.cache";
import {
  FilterPanel,
  FilterTriggerButton,
  FilterState,
  DEFAULT_FILTERS,
  getActiveFilterCount,
} from "@/components/customer/shared/FilterPanel";
import { CategoryPillsBar } from "@/components/customer/landing/CategoryPillsBar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PackageOpen, Filter, Loader2 } from "lucide-react";
import { startTransition } from "react";

const ITEMS_PER_PAGE = 16;

// ===========================
const CATEGORY_EXPANSIONS: Record<string, string[]> = {
  // Produce: ["Fruits", "Vegetables"],
  // Add more as needed e.g:
  // "Sweets & Mithai": ["Sweets", "Mithai", "Desserts"],
};

// Expands selected categories for backend — e.g. "Produce" → ["Fruits", "Vegetables"]
const expandCategories = (cats: string[]) =>
  cats.flatMap((c) => CATEGORY_EXPANSIONS[c] ?? [c]);
// ------------------------------

interface ProductsSectionProps {
  storeId: string;
  initialData: PaginatedProductsResponse;
  subsidized?: boolean;
}

export function ProductsSection({
  storeId,
  initialData,
  subsidized,
}: ProductsSectionProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const [cartMap, setCartMap] = useState<Record<string, number>>({});

  // 1. Fetch Cart State
  useEffect(() => {
    const fetchInitialCart = async () => {
      try {
        const map = await getCartQuantities();
        if (map) setCartMap(map);
      } catch (error) {
        console.error("Failed to fetch cart products quantities:", error);
      }
    };
    fetchInitialCart();
  }, []);

  // 2. SWR Data Fetching Strategy (Vercel client-swr-dedup Best Practice)
  const cacheKey = ["products", storeId, currentPage, filters];

  const { data, isLoading } = useSWR<PaginatedProductsResponse>(
    cacheKey,
    async () => {
      return await getCachedStoreProducts(
        storeId,
        currentPage,
        ITEMS_PER_PAGE,
        {
          // categories: filters.categories,  old
          categories: expandCategories(filters.categories),
          inStockOnly: filters.inStockOnly,
          subsidisedOnly: filters.subsidisedOnly || subsidized,
          sortBy: filters.sortBy as any,
        },
      );
    },
    {
      fallbackData:
        currentPage === 1 && getActiveFilterCount(filters) === 0
          ? initialData
          : undefined,
      keepPreviousData: true,
      revalidateOnFocus: false,
    },
  );

  // 3. Background Preloading (Load Page 2 invisibly)
  useEffect(() => {
    if (data && currentPage < data.totalPages) {
      getCachedStoreProducts(storeId, currentPage + 1, ITEMS_PER_PAGE, {
        categories: filters.categories,
        inStockOnly: filters.inStockOnly,
        subsidisedOnly: filters.subsidisedOnly || subsidized,
        sortBy: filters.sortBy as any,
      });
    }
  }, [currentPage, data, filters, storeId, subsidized]);

  const scrollToGrid = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!gridRef.current) return;
        const rect = gridRef.current.getBoundingClientRect();
        const absoluteTop = window.scrollY + rect.top;
        window.scrollTo({ top: absoluteTop - 120, behavior: "smooth" });
      });
    });
  };

  const updateFilters = (partial: Partial<FilterState>) => {
    startTransition(() => {
      setFilters((prev) => ({ ...prev, ...partial }));
      setCurrentPage(1);
    });
    scrollToGrid();
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
    scrollToGrid();
  };

  const handleCategorySelect = (cat: string | null) => {
    if (cat === null) {
      updateFilters({ categories: [] });
    } else {
      const next = filters.categories.includes(cat)
        ? filters.categories.filter((c) => c !== cat)
        : [...filters.categories, cat];
      updateFilters({ categories: next });
    }
  };

  const activeFilterCount = getActiveFilterCount(filters);
  const currentProducts = data?.products || [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.totalCount || 0;

  const headingLabel =
    filters.categories.length === 1
      ? filters.categories[0]
      : filters.categories.length > 1
        ? "Multiple Categories"
        : "All Products";

  // Shadcn Pagination Number Generator
  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, "ellipsis", totalPages];
    if (currentPage >= totalPages - 2)
      return [
        1,
        "ellipsis",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    return [
      1,
      "ellipsis",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis",
      totalPages,
    ];
  };

  return (
    <>
      <CategoryPillsBar
        activeCategories={filters.categories}
        onSelect={handleCategorySelect}
      />
      <div ref={gridRef}></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex flex-col w-60 shrink-0">
            <div
              className="sticky top-15 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col"
              style={{ maxHeight: "calc(100vh - 5rem)" }}
            >
              <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-slate-50 shrink-0">
                <Filter className="h-4 w-4 text-slate-400" />
                <span className="font-bold text-slate-900 text-sm">
                  Filters
                </span>
                {activeFilterCount > 0 && (
                  <span className="bg-green-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ml-auto">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <FilterPanel
                  filters={filters}
                  onChange={updateFilters}
                  onReset={resetFilters}
                />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-8">
            <div className="scroll-mt-28">
              <div className="flex items-end justify-between mb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h2 className="font-black text-slate-900 text-2xl tracking-tight leading-none">
                      {headingLabel}
                    </h2>
                    {isLoading && (
                      <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                    )}
                  </div>
                  <p className="text-sm text-slate-400 font-medium">
                    <span className="text-slate-600 font-semibold">
                      {totalItems}
                    </span>{" "}
                    items
                    {activeFilterCount > 0 && (
                      <>
                        {" · "}
                        <button
                          onClick={resetFilters}
                          className="text-green-600 hover:text-green-700 font-semibold transition-colors"
                        >
                          Clear filters
                        </button>
                      </>
                    )}
                  </p>
                </div>
                <div className="lg:hidden">
                  <FilterTriggerButton
                    activeCount={activeFilterCount}
                    onClick={() => setFilterSheetOpen(true)}
                  />
                </div>
              </div>

              {/* Product Grid */}
              <div
                className={`transition-opacity duration-300 ${isLoading && !currentProducts.length ? "opacity-50" : "opacity-100"}`}
              >
                {currentProducts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {currentProducts.map((product, i) => (
                      <div
                        key={product._id}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${i * 30}ms` }}
                      >
                        <CustomerProductCard
                          subsidyPage={subsidized ?? false}
                          product={product}
                          cartQuantity={cartMap[product._id as string] || 0}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <PackageOpen className="h-8 w-8 opacity-40" />
                    </div>
                    <p className="font-bold text-slate-600">
                      No products found
                    </p>
                    <button
                      onClick={resetFilters}
                      className="mt-1 text-sm text-green-600 font-semibold hover:text-green-700 underline underline-offset-2 transition-colors"
                    >
                      Start fresh
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Pagination with Shadcn UI Numbers restored */}
            {totalPages > 1 && (
              <div className="pt-4 border-t border-slate-100">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) {
                            setCurrentPage((p) => p - 1);
                            scrollToGrid();
                          }
                        }}
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-40"
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
                              setCurrentPage(page as number);
                              scrollToGrid();
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
                          if (currentPage < totalPages) {
                            setCurrentPage((p) => p + 1);
                            scrollToGrid();
                          }
                        }}
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-40"
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
      </div>

      {/* Mobile Filter Sheet Component */}
      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent
          side="right"
          className="w-full max-w-[80%] sm:max-w-90 p-0 flex flex-col overflow-hidden"
        >
          <SheetHeader className="px-5 pt-5 pb-3 border-b border-slate-100 shrink-0">
            <SheetTitle className="flex items-center gap-2 text-base text-slate-900">
              <Filter className="h-4 w-4 text-slate-400" />
              Filters
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-hidden relative">
            <div className="h-full overflow-y-auto px-5 pt-3 pb-24">
              <FilterPanel
                filters={filters}
                onChange={updateFilters}
                onReset={resetFilters}
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
              <button
                onClick={() => {
                  setFilterSheetOpen(false);
                  scrollToGrid();
                }}
                className="w-full h-12 rounded-2xl bg-green-600 hover:bg-green-700 active:scale-[0.98] transition-all text-white font-bold text-sm shadow-lg shadow-green-600/25 flex items-center justify-center gap-2"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.35s ease both;
        }
      `}</style>
    </>
  );
}
