import ReceiptPage from "@/components/admin/analytics/reciept/RecieptComponent";
import StorePayoutHistory from "@/components/admin/analytics/reciept/StorePayoutHistory";
import PayoutStatsCards, { PayoutStatsCardsSkeleton } from "@/components/store/payouts/PayoutStatsCards";
import PayoutScheduleConfig from "@/components/admin/payoutSchedule/Payoutscheduleconfig";
import ManualPayoutTrigger from "@/components/admin/payoutSchedule/Manualpayouttrigger";
import { Suspense } from "react";

const StorePayoutReciepts = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-400 mx-auto">
      {/* Analytics Stats */}
      <Suspense fallback={<PayoutStatsCardsSkeleton />}>
        <PayoutStatsCards storeId={storeId} />
      </Suspense>

      {/* Auto-Payout Schedule + Manual Trigger side by side */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold tracking-tight text-gray-900">
            Auto-Payout Settings
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure automatic payout generation or trigger one manually.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <PayoutScheduleConfig storeId={storeId} />
          <ManualPayoutTrigger />
        </div>
      </div>
      {/* History & Filters */}
      <div className="space-y-4">
        <StorePayoutHistory storeId={storeId} />
      </div>
      {/* Generate Receipt */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Generate Receipt
        </h2>
        <ReceiptPage initialStoreId={storeId} />
      </div>
    </div>
  );
};

export default StorePayoutReciepts;