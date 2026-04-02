import { getMyStoreData } from "@/actions/store/getStores.actions";
import { StoreDocument } from "@/types/store/store";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getOrderStats } from "@/actions/admin/orders/getOrderStats.action";
import { OrdersList } from "@/components/admin/store/OrdersList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders", // This becomes "Orders | Store Panel - Candian's Cart" in the browser tab
};

const StoreOrdersPage = async () => {
  const storeDataResponse = await getMyStoreData();
  if (!storeDataResponse.success || !storeDataResponse.data) {
    return <div>Error: {storeDataResponse.error || "Could not load store data"}</div>;
  }
  const storeData: StoreDocument = storeDataResponse.data;
  const storeId = storeData._id;
  const stats = await getOrderStats(storeId);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-5">
      <Link
        href="/store"
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-2 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
      </Link>
      <OrdersList storeId={storeId} stats={stats} role="store" />
    </div>
  );
};
export default StoreOrdersPage;