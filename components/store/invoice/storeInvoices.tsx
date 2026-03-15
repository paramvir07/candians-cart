"use client";

import React, { useState, useEffect } from "react";
import InvoiceCard, { InvoiceProps } from "@/components/store/invoice/InvoiceCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CirclePlus, Receipt } from "lucide-react";
import { toast } from "sonner";
import { getInvoices } from "@/actions/store/invoice/getInvoices"; // Adjust path based on your folder structure

// Reusable Skeleton for loading state
const InvoiceSkeleton = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-4 shadow-sm">
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
      <Skeleton className="h-8 w-8 rounded-md" />
    </div>
    <Skeleton className="h-20 w-full rounded-lg" />
    <Skeleton className="h-10 w-full rounded-md mt-auto" />
  </div>
);

const StoreInvoices = ({ storeId }: { storeId: string }) => {
  const [invoices, setInvoices] = useState<InvoiceProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const fetchInvoices = async () => {
      try {
        const result = await getInvoices(storeId);
        if (!isMounted) return;

        if (result.success && result.data) {
          setInvoices(result.data);
        } else {
          toast.error(result.error || "Failed to load invoices.");
        }
      } catch (error) {
        if (isMounted) toast.error("An unexpected error occurred while fetching invoices.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchInvoices();

    return () => {
      isMounted = false;
    };
  }, [storeId]); // Re-fetch if the storeId prop ever changes

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Price Invoices
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage and view vendor invoices.
        </p>
      </div>

      {/* Add Invoice Banner */}
      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200">
        <p className="text-sm font-medium text-slate-600">
          Want to add a new Invoice?
        </p>
        <Button asChild>
          {/* Passing storeId in the URL so the add page knows which store it belongs to */}
          <Link href={`/store/invoice/add?storeId=${storeId}`} className="flex items-center gap-2">
            <CirclePlus className="h-4 w-4" />
            Add Invoice
          </Link>
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {isLoading ? (
          // Show 4 skeletons while loading
          Array.from({ length: 4 }).map((_, i) => <InvoiceSkeleton key={i} />)
        ) : invoices.length > 0 ? (
          // Show Invoices
          invoices.map((invoice) => (
            <InvoiceCard key={invoice._id} invoice={invoice} />
          ))
        ) : (
          // Empty State
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-2xl bg-muted/20">
            <Receipt className="h-12 w-12 mb-3 opacity-25" />
            <p className="font-medium">No invoices uploaded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreInvoices;