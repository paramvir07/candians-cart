import ReceiptPage from "@/components/admin/analytics/reciept/RecieptComponent";
import StoreInvoices from "@/components/store/invoice/storeInvoices";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, FileWarning } from "lucide-react";
import { getStoreDetailAction } from "@/actions/admin/analytics/store/getStoreDetail.action";
import StoreProfileHeader from "@/components/admin/analytics/store/StoreProfileHeader";
import StoreRecentOrders from "@/components/admin/analytics/store/StoreRecentOrders";
import StorePayoutReceipts from "@/components/admin/analytics/store/StorePayoutReciepts";
import StoreStatCards from "@/components/admin/analytics/store/StoreStatsCards";

const page = async ({ params }: { params: Promise<{ storeId: string }> }) => {
  const { storeId } = await params;
  const { profile, stats, recentOrders, recentPayoutReceipts } =
    await getStoreDetailAction(storeId);
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
          {/* Back nav */}
          <Link
            href="/admin/stores"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to all stores
          </Link>

          {/* Store profile card */}
          <StoreProfileHeader profile={profile} />

          {/* 5 stat cards */}
          <StoreStatCards stats={stats} />

          {/* Orders + Invoices side by side */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
            <StoreRecentOrders orders={recentOrders} storeId={storeId} />
            <StorePayoutReceipts
              receipts={recentPayoutReceipts}
              storeId={storeId}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Receipts Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Receipts & Analytics
          </h2>
          <ReceiptPage initialStoreId={storeId} />
        </div>

        <Link href={`/admin/store/${storeId}/products/price-changes`}>
          <Button variant="outline" className="flex items-center gap-2">
            <FileWarning className="w-4 h-4" />
            Review Price Changes
          </Button>
        </Link>

        {/* Invoices Section (Client Component handles fetching & state) */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Invoices</h2>
          <StoreInvoices storeId={storeId} />
        </div>
      </div>
    </>
  );
};

export default page;
