import ReceiptPage from "@/components/admin/analytics/reciept/RecieptComponent";
import StorePayoutHistory from "@/components/admin/analytics/reciept/StorePayoutHistory";
import PayoutStatsCards, { PayoutStatsCardsSkeleton } from "@/components/store/payouts/PayoutStatsCards";
import { Suspense } from "react";

const StorePayoutReciepts = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;
  
  return (
   <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-400 mx-auto">
      
      {/* Analytics Stats Section */}
      <Suspense fallback={<PayoutStatsCardsSkeleton />}>
         <PayoutStatsCards storeId={storeId} />
      </Suspense>

      {/* Top Section: Generate New Receipt */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Generate Receipt
        </h2>
        <ReceiptPage initialStoreId={storeId} />
      </div>

      {/* Bottom Section: History & Filters */}
      <div className="space-y-4">
        <StorePayoutHistory storeId={storeId} />
      </div>
      
    </div>
  );
};

export default StorePayoutReciepts;