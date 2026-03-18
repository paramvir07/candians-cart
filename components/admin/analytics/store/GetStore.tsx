"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Clock,
  PlusCircle,
  Store,
  Search,
  ArrowRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { StoreDocument } from "@/types/store/store";
import { searchStores } from "@/actions/common/searchStore.action";
import { SearchBar } from "@/components/shared/SearchBar";

const StoreCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden animate-pulse">
    <div className="p-5 flex-1 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-3/5 rounded-lg" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
      <Skeleton className="h-3.5 w-full rounded" />
      <Skeleton className="h-3.5 w-4/5 rounded" />
      <div className="mt-auto pt-4 border-t border-gray-50 space-y-2.5">
        <Skeleton className="h-3 w-2/3 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
      </div>
    </div>
  </div>
);

export default function StoreInfo() {
  const [stores, setStores] = useState<StoreDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInitialStores = async () => {
      setIsLoading(true);
      try {
        const result = await searchStores("");
        if (result.success) {
          setStores(result.data);
        } else {
          toast.error(result.error || "Failed to fetch stores");
        }
      } catch (err) {
        console.error("An unexpected error occurred", err);
        toast.error("An unexpected error occurred while fetching stores");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialStores();
  }, []);

  return (
    <section className="space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 p-2 rounded-xl">
            <Store className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
              All Stores
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              {isLoading
                ? "Loading..."
                : `${stores.length} store${stores.length !== 1 ? "s" : ""} registered`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <SearchBar<StoreDocument>
            placeholder="Search stores..."
            searchAction={searchStores}
            onSearchStart={() => setIsLoading(true)}
            onResults={(data) => {
              setStores(data);
              setIsLoading(false);
            }}
          />
          <Button
            asChild
            size="sm"
            className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 rounded-xl"
          >
            <Link href="/admin/new-user/store">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs font-semibold">
                Add Store
              </span>
              <span className="sm:hidden text-xs font-semibold">Add</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StoreCardSkeleton key={i} />)
        ) : stores.length > 0 ? (
          stores.map((store) => (
            <Link
              key={store._id.toString()}
              href={`/admin/store/${store._id}`}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-200 flex flex-col overflow-hidden hover:-translate-y-0.5"
            >
              {/* Top accent bar */}
              <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="p-5 flex-1 flex flex-col">
                {/* Name row */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <h3 className="font-semibold text-base text-gray-900 line-clamp-1 group-hover:text-emerald-700 transition-colors leading-snug">
                    {store.name}
                  </h3>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-1.5 ring-2 ring-emerald-100" />
                </div>

                {/* Description */}
                <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 mb-4 flex-1 leading-relaxed">
                  {store.description ||
                    "No description provided for this store."}
                </p>

                {/* Meta */}
                <div className="mt-auto pt-3.5 border-t border-gray-50 space-y-2">
                  <div className="flex items-start gap-2 text-gray-500">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                    <span className="line-clamp-1 text-xs leading-tight">
                      {store.address || "Location not specified"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="text-xs">9:00 AM – 9:00 PM</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/40 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">
                  View store
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all duration-200" />
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full">
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <div className="bg-gray-100 p-3 rounded-2xl mb-3">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-600 font-semibold text-sm">
                No stores found
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Try adjusting your search or add a new store
              </p>
              <Button
                asChild
                size="sm"
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 rounded-xl"
              >
                <Link href="/admin/new-store">
                  <PlusCircle className="h-3.5 w-3.5" />
                  Add Store
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
