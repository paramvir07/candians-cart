// components/customer/landing/HeroBannerLoader.tsx
import Store from "@/db/models/store/store.model";
import { HeroBanner } from "./HeroBanner";
import { StoreDocument } from "@/types/store/store";

export async function HeroBannerLoader({ storeId }: { storeId: string }) {
  const storeDoc = await Store.findById(storeId).lean();
  const store: StoreDocument = JSON.parse(JSON.stringify(storeDoc));
  return <HeroBanner store={store} />;
}