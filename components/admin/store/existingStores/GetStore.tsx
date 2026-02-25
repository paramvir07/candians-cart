"use client";
import React, { useState, useEffect } from "react";
import { MapPin, Clock, Edit, Trash2, PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { StoreDocument } from "@/types/store/store";

// Import your new component and search action
import { searchStores } from "@/actions/common/searchStore.action";
import { SearchBar } from "@/components/shared/SearchBar";

// --- SKELETON COMPONENT ---
const StoreCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-56">
      <div className="p-5 flex-1 flex flex-col">
        <Skeleton className="h-6 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-4" />

        <div className="mt-auto space-y-3 pt-4 border-t border-slate-100">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="p-3 bg-slate-50 border-t border-slate-200 grid grid-cols-2 gap-3">
        <Skeleton className="h-9 w-full rounded-lg" />
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
    </div>
  );
};

const StoreInfo = () => {
  const [stores, setStores] = useState<StoreDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data on mount using an empty search query
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
    <div className="max-w-7xl mx-auto p-6 md:p-8 bg-[#F9FAFB] min-h-screen">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Stores</h1>
          <p className="text-slate-500 mt-2">
            Manage your store locations, details, and timings.
          </p>
        </div>

        {/* --- Reusable Search Bar --- */}
        <SearchBar<StoreDocument>
          placeholder="Search stores or locations..."
          searchAction={searchStores}
          onSearchStart={() => setIsLoading(true)}
          onResults={(data) => {
            setStores(data);
            setIsLoading(false);
          }}
        />
      </div>

      {/* Add New Store Banner */}
      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200 mb-8 shadow-sm">
        <p className="text-sm font-medium text-slate-600">
          Want to add a new store location?
        </p>
        <Button asChild>
          <Link href="/admin/new-store" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Store
          </Link>
        </Button>
      </div>

      {/* Existing Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          // Render Skeletons
          Array.from({ length: 4 }).map((_, i) => <StoreCardSkeleton key={i} />)
        ) : stores.length > 0 ? (
          // Render Actual Data returned from the server search
          stores.map((store) => (
            <div
              key={store._id.toString()}
              className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden"
            >
              {/* Wrapped the main card content in a Link */}
              <Link 
                href={`/admin/store/${store._id}`}
                className="p-5 flex-1 flex flex-col cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3
                    className="font-semibold text-lg text-slate-900 line-clamp-1 group-hover:text-slate-600 transition-colors"
                    title={store.name}
                  >
                    {store.name}
                  </h3>
                </div>

                <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">
                  {store.description ||
                    "No description provided for this store."}
                </p>

                <div className="mt-auto pt-4 border-t border-slate-100 space-y-3">
                  {/* Location Data */}
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <span className="line-clamp-2 leading-tight">
                      {store.address || "Location not specified"}
                    </span>
                  </div>

                  {/* Timing Data (Assuming a timing field exists, mapping to static text as placeholder) */}
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      {/* Replace this string with store.timing if available in your schema */}
                      9:00 AM - 9:00 PM
                    </span>
                  </div>
                </div>
              </Link>

              {/* Action Buttons are kept outside the Link to prevent navigation when clicking Edit/Delete */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 grid grid-cols-2 gap-3 relative z-10">
                <Link
                  href={`/admin/store/${store._id}/edit`}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>

                <button
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-100 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors"
                  onClick={(e) => {
                    // Implement delete functionality here similarly to deleteProduct
                    console.log(`Delete store ${store._id}`);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-slate-500 border-2 border-dashed border-slate-200 rounded-xl bg-white">
            No stores found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreInfo;