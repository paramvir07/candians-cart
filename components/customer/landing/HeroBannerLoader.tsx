// components/customer/landing/HeroBannerLoader.tsx
import getStoreAndProduct from "@/actions/customer/ProductAndStore/getAssociatedStore";
import Store from "@/db/models/store/store.model";
import { HeroBanner } from "./HeroBanner";
import { StoreDocument } from "@/types/store/store";

export async function HeroBannerLoader() {
  const storeResponse = await getStoreAndProduct();

  if (!storeResponse.success || !storeResponse.customer?.associatedStoreId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 max-w-md shadow-sm">
          <h3 className="font-bold text-lg mb-2">Unable to Load Store</h3>
          <p className="text-sm text-red-500">
            {storeResponse.error || "Please verify your account matches a registered Candian's Cart store."}
          </p>
        </div>
      </div>
    );
  }

  const storeId = storeResponse.customer.associatedStoreId.toString();
  const storeDoc = await Store.findById(storeId).lean();
  const store: StoreDocument = JSON.parse(JSON.stringify(storeDoc));

  return <HeroBanner store={store} />;
}