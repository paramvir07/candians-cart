import StoreInvoices from "@/components/store/invoice/storeInvoices";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, FileWarning } from "lucide-react";
import { getStoreDetailAction } from "@/actions/admin/analytics/store/getStoreDetail.action";
import StoreProfileHeader from "@/components/admin/analytics/store/StoreProfileHeader";
import StoreRecentOrders from "@/components/admin/analytics/store/StoreRecentOrders";
import StorePayoutReceipts from "@/components/admin/analytics/store/StorePayoutReciepts";
import StoreStatCards from "@/components/admin/analytics/store/StoreStatsCards";
import CashActivityWidget from "@/components/shared/cash-collection/CashActivityWidget";
import { getRecentCashActivities } from "@/actions/common/getCashActivities.action";

const StoreDetailPage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;
  const { profile, stats, recentOrders, recentPayoutReceipts } =
    await getStoreDetailAction(storeId);

  const cashActivities = await getRecentCashActivities(storeId, 6);
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to dashboard
          </Link>

          <StoreProfileHeader profile={profile} />

          <StoreStatCards stats={stats} storeId={storeId} />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
            <StoreRecentOrders orders={recentOrders} storeId={storeId} />
            <StorePayoutReceipts
              receipts={recentPayoutReceipts}
              storeId={storeId}
            />
            <CashActivityWidget
              activities={cashActivities}
              viewAllHref={`/admin/store/${storeId}/cash-collection`}
              showStore={false}
            />
          </div>
        </div>
      </div>

      <div className="mx-10">
        <div className="mb-5">
          <Link href={`/admin/store/${storeId}/products/price-changes`}>
            <Button variant="outline" className="flex items-center gap-2">
              <FileWarning className="w-4 h-4" />
              Review Price Changes
            </Button>
          </Link>
        </div>
        {/* Invoices Section (Client Component handles fetching & state) */}
        <div className="space-y-4">
          <StoreInvoices storeId={storeId} />
        </div>
      </div>
    </>
  );
};

export default StoreDetailPage;
