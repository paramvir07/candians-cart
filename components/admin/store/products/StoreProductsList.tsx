"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, PackageOpen, CirclePlus, Store } from "lucide-react";
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
import { ProductCard, ProductCardRole } from "./ProductCard";
import { IProduct } from "@/types/store/products.types";
import { Button } from "@/components/ui/button";
import { AdminProduct, getStoreProductsPaginated, searchProducts } from "@/actions/admin/products/getProducts.action";

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

interface StoreProductsListProps {
  storeId?: string;
  role: ProductCardRole;
}

export const StoreProductsList = ({
  storeId,
  role,
}: StoreProductsListProps) => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);

  const isAllStores = !storeId;

  useEffect(() => {
    let mounted = true;
    if (isSearchMode) return;
    const load = async () => {
      setIsLoading(true);
      const result = await getStoreProductsPaginated(storeId, currentPage, 12);
      if (!mounted) return;
      if (result.success) {
        setProducts(result.data);
        setTotalPages(result.totalPages ?? 1);
      } else {
        toast.error(result.error || "Failed to fetch products");
      }
      setIsLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, [storeId, currentPage, isSearchMode]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setIsSearchMode(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchMode(true);
      setIsLoading(true);
      const res = await searchProducts(searchQuery, storeId);
      if (res.success) setProducts(res.data);
      else toast.error(res.error || "Search failed");
      setIsLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery, storeId]);

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
      : storeId
        ? `/admin/store/${storeId}/products/add`
        : "/admin/products/add";

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {titles[role].heading}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isSearchMode
              ? `Showing results for "${searchQuery}"`
              : titles[role].sub}
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))
        ) : products.length > 0 ? (
          products.map((product) => (
            <div key={product._id} className="flex flex-col gap-0">
              {/* Store chip — only shown in all-stores view */}
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
