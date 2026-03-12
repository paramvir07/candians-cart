"use client";

import { useState, useEffect } from "react";
import InvoiceCard, { InvoiceProps } from "@/components/store/invoice/InvoiceCard";
import { getInvoices } from "@/actions/store/invoice/getInvoices";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Receipt } from "lucide-react";

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

export default function StoreInvoices() {
  const [searchQuery, setSearchQuery] = useState("");
  const [invoices, setInvoices] = useState<InvoiceProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const fetchInvoices = async () => {
      const result = await getInvoices(searchQuery);
      if (!isMounted) return;

      if (result.success && result.data) {
        setInvoices(result.data);
      } else {
        toast.error(result.error || "Failed to load invoices.");
      }
      setIsLoading(false);
    };

    // Debounce search by 300ms
    const timer = setTimeout(() => {
      fetchInvoices();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900">Recent Invoices</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {isLoading ? (
          // Show skeletons while loading
          Array.from({ length: 4 }).map((_, i) => <InvoiceSkeleton key={i} />)
        ) : invoices.length > 0 ? (
          // Map over the array to render multiple cards
          invoices.map((invoice) => (
            <InvoiceCard key={invoice._id} invoice={invoice} />
          ))
        ) : (
          // Empty State
          <div className="col-span-full py-8 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl bg-muted/20">
            <Receipt className="h-8 w-8 mb-2 opacity-25" />
            <p className="font-medium text-sm">No invoices found.</p>
          </div>
        )}
      </div>
    </div>
  );
}