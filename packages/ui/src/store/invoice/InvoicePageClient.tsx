"use client";

import { useState, useEffect, useMemo } from "react";
import InvoiceCard, { InvoiceProps } from "@/components/store/invoice/InvoiceCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CirclePlus, ArrowLeft, Search, Receipt } from "lucide-react";
import { toast } from "sonner";
import { getInvoices } from "@/actions/store/invoice/getInvoices";

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

const InvoicePageClient = ({ storeId }: { storeId: string }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [invoices, setInvoices] = useState<InvoiceProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch Invoices ONCE when the component mounts
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const fetchInvoices = async () => {
      const result = await getInvoices(storeId);
      if (!isMounted) return;

      if (result.success && result.data) {
        setInvoices(result.data);
      } else {
        toast.error(result.error || "Failed to load invoices.");
      }
      setIsLoading(false);
    };

    fetchInvoices();

    return () => {
      isMounted = false;
    };
  }, [storeId]);

  // 2. Client-side filtering (Blazingly fast, no DB calls)
  const filteredInvoices = useMemo(() => {
    if (!searchQuery.trim()) return invoices;
    
    const lowerQuery = searchQuery.toLowerCase();
    return invoices.filter(
      (inv) =>
        inv.vendorName.toLowerCase().includes(lowerQuery) ||
        inv.InvoiceNumber.toString().includes(lowerQuery) ||
        (inv.productNameInInvoice && inv.productNameInInvoice.toLowerCase().includes(lowerQuery))
    );
  }, [invoices, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Back Link */}
      <Link
        href="/store"
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-2 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
      </Link>

      {/* Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Invoices
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage and view your vendor invoices.
          </p>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search vendor or invoice #..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Add Invoice Banner */}
      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200">
        <p className="text-sm font-medium text-slate-600">
          Want to add a new Invoice?
        </p>
        <Button asChild>
          {/* Include the storeId in the URL so the Add page knows which store it is */}
          <Link href={`/store/invoice/add?storeId=${storeId}`} className="flex items-center gap-2">
            <CirclePlus className="h-4 w-4" />
            Add Invoice
          </Link>
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {isLoading ? (
          // Show 8 skeletons while loading
          Array.from({ length: 8 }).map((_, i) => <InvoiceSkeleton key={i} />)
        ) : filteredInvoices.length > 0 ? (
          // Show Filtered Invoices
          filteredInvoices.map((invoice) => (
            <InvoiceCard key={invoice._id} invoice={invoice} />
          ))
        ) : (
          // Empty State
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-2xl bg-muted/20">
            <Receipt className="h-12 w-12 mb-3 opacity-25" />
            <p className="font-medium">
              {searchQuery
                ? "No invoices matched your search."
                : "No invoices uploaded yet."}
            </p>
            {searchQuery && (
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
    </div>
  );
};

export default InvoicePageClient;