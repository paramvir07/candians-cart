import { getInvoiceWithPriceChange } from "@/actions/admin/invoice/getPriceChange";
import PriceChangesTable from "@/components/admin/store/products/PriceChangeTable";
import Link from "next/link";

export default async function StorePriceChangesPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  // Fetch only the price changes for THIS specific store
  const resolvedParams = await params;
  const {
    data: invoices,
    success,
    message,
  } = await getInvoiceWithPriceChange(resolvedParams.storeId);

  return (
    <div className="p-6 space-y-6">
      <div>
        {/* Back link */}
        <Link
          href= {`/admin/store/${resolvedParams.storeId}`}
          className="inline-block text-sm text-blue-600 hover:underline"
        >
          ← Go back
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          Invoice Price Reviews
        </h1>
        <p className="text-muted-foreground">
          Review recent price changes and new products added via invoices.
        </p>
      </div>

      {/* Pass the serialized data down to a client component to handle the UI/Modals */}
      {success && invoices ? (
        <PriceChangesTable invoices={invoices} />
      ) : (
        <div className="text-red-500">{message}</div>
      )}
    </div>
  );
}
