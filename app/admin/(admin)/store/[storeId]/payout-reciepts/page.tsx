import ReceiptPage from "@/components/admin/analytics/reciept/RecieptComponent";
import StorePayoutHistory from "@/components/admin/analytics/reciept/StorePayoutHistory";

const StorePayoutReciepts = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;
  
  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-400 mx-auto">
      
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