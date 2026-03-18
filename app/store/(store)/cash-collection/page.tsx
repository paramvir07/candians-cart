import { getMyStoreData }     from "@/actions/store/getStores.actions";
import { CashCollectionList } from "@/components/shared/cash-collection/CashCollectionList";
import { ArrowLeft }          from "lucide-react";
import Link                   from "next/link";

export default async function StoreCashCollectionPage() {
  const storeDataResponse = await getMyStoreData();
  if (!storeDataResponse.success || !storeDataResponse.data) {
    return <div>Error: {storeDataResponse.error || "Could not load store data"}</div>;
  }
  const storeId = storeDataResponse.data._id;
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-5">
      <Link href="/store"
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-2 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cash Collection</h1>
        <p className="text-sm text-gray-500 mt-1">Cash orders and wallet top-ups for your store</p>
      </div>
      <CashCollectionList storeId={storeId} role="store" />
    </div>
  );
}
