import { getAllInvoicesWithPriceChange } from "@/actions/admin/invoice/getPriceChange";
import AllPriceChangesTable from "@/components/admin/store/products/AllPriceChangeTable";
import Link from "next/link";
import { CirclePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function GlobalPriceChangesPage() {
  const response = await getAllInvoicesWithPriceChange();

  return (
<div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Global Invoices & Price Reviews
          </h1>
          <p className="text-muted-foreground">
            Review recent price changes and new products added across all stores.
          </p>
        </div>
      </div>

      {/* Add Invoice Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200 gap-4">
        <p className="text-sm font-medium text-slate-600">
          Want to add a new Invoice to Candian Cart?
        </p>
        <Button asChild className="shrink-0">
          {/* 
            Since this is the global admin view, we omit the ?storeId parameter.
            The InvoiceForm will detect the admin session and display the store selector.
          */}
          <Link href="/admin/price-invoices/add" className="flex items-center gap-2">
            <CirclePlus className="h-4 w-4" />
            Add Invoice
          </Link>
        </Button>
      </div>

      {/* Early Exit Pattern for strict TypeScript narrowing */}
      {!response.success ? (
        <div className="p-4 bg-red-50 border border-red-100 rounded-md">
          <p className="text-sm font-medium text-red-600">
            {response.message || "Failed to load invoices."}
          </p>
        </div>
      ) : (
        <AllPriceChangesTable invoices={response.data ?? []} />
      )}
    </div>
  );
}