import { getMyStoreData } from "@/actions/store/getStores.actions";
import { StoreProductsList } from "@/components/admin/store/products/StoreProductsList";
import { StoreDocument } from "@/types/store/store";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getProductStats } from "@/actions/admin/products/getProductStats.action";
import ProductStatCards from "@/components/shared/products/ProductStatsCards";

const StoreProductsPage = async () => {
  const storeDataResponse = await getMyStoreData();
  if (!storeDataResponse.success || !storeDataResponse.data) {
    return <div>Error: {storeDataResponse.error || "Could not load store data"}</div>;
  }
  const storeData: StoreDocument = storeDataResponse.data;
  const storeId = storeData._id.toString();
  const stats = await getProductStats(storeId);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-5">
      <Link href="/store" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-2 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
      </Link>
      <ProductStatCards stats={stats} />
      <StoreProductsList storeId={storeId} role="store" />
    </div>
  );
};
export default StoreProductsPage;
