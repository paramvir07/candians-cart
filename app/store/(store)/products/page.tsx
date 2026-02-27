import { StoreProductsList } from "@/components/admin/store/products/StoreProductsList";
import { getMyStoreData } from "@/actions/store/getStores.actions";
import { StoreDocument } from "@/types/store/store";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const products = async () => {
  const storeDataResponse = await getMyStoreData();
  const storeData: StoreDocument = storeDataResponse.data;
  const storeId = storeData._id;
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <Link
        href="/store"
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
      </Link>
      <StoreProductsList storeId={storeId} role="store" />
    </div>
  );
};

export default products;
