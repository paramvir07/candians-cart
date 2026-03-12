import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StoreProductsList } from "@/components/admin/store/products/StoreProductsList";
import ReceiptPage from "@/components/admin/analytics/reciept/RecieptComponent";
import StoreInvoices from "@/components/store/invoice/storeInvoices"; // Adjust path if needed

const StoreProductsPage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <Link
        href="/admin/store"
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Stores
      </Link>

      {/* Receipts Section */}
      <ReceiptPage initialStoreId={storeId} />

      {/* Invoices Section (Client Component handles fetching & state) */}
      <StoreInvoices />

      {/* Products Section */}
      <StoreProductsList storeId={storeId} role="admin" />
    </div>
  );
};

export default StoreProductsPage;