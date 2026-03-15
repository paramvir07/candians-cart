
import ReceiptPage from "@/components/admin/analytics/reciept/RecieptComponent";

const StorePayoutReciepts = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">
        Receipts & Analytics
      </h2>
      <ReceiptPage initialStoreId={storeId} />
    </div>
  );
};

export default StorePayoutReciepts