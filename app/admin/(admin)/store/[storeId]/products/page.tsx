import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { StoreProductsList } from "@/components/admin/store/products/StoreProductsList";
import ReceiptPage from "@/components/admin/analytics/reciept/RecieptComponent";
import StoreInvoices from "@/components/store/invoice/storeInvoices";

// Import the Server Component and its Skeleton
import StoreOverviewCards from "@/components/admin/store/overview/StoreOverviewCards";
import StoreOverviewCardsSkeleton from "@/components/admin/store/overview/StoreOverviewCardsSkeleton";

const StoreProductsPage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <Link
        href="/admin/store"
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Stores
      </Link>

      {/* Best Practice: Wrap async Server Components in Suspense 
        so they don't block the rest of the page from rendering.
      */}
      <Suspense fallback={<StoreOverviewCardsSkeleton />}>
        <StoreOverviewCards storeId={storeId} />
      </Suspense>

      {/* Receipts Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Receipts & Analytics</h2>
        <ReceiptPage initialStoreId={storeId} />
      </div>

      {/* Invoices Section (Client Component handles fetching & state) */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Invoices</h2>
        <StoreInvoices storeId={storeId}/>
      </div>

      {/* Products Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Store Products</h2>
        <StoreProductsList storeId={storeId} role="admin" />
      </div>
    </div>
  );
};

export default StoreProductsPage;