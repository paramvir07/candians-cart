import { getAllInvoicesWithPriceChange } from "@/actions/admin/invoice/getPriceChange";
import AllPriceChangesTable from "@/components/admin/store/products/AllPriceChangeTable";

export default async function GlobalPriceChangesPage() {
  const { data: invoices, success, message } = await getAllInvoicesWithPriceChange();

  return (
    <div className="p-6 space-y-6">

      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Global Invoices & Price Reviews
        </h1>
        <p className="text-muted-foreground">
          Review recent price changes and new products added across all stores.
        </p>
      </div>

      {success && invoices ? (
        <AllPriceChangesTable invoices={invoices} />
      ) : (
        <div className="text-red-500">{message}</div>
      )}
    </div>
  );
}