// components/customer/products/ProductsSectionLoader.tsx
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import getStoreAndProduct from "@/actions/customer/ProductAndStore/getAssociatedStore";
import { getCachedStoreProducts } from "@/actions/cache/product.cache";
import { ProductsSection } from "./ProductsSection";

export async function ProductsSectionLoader() {
  const storeResponse = await getStoreAndProduct();
  if (!storeResponse.success || !storeResponse.customer?.associatedStoreId) return null;

  const storeId = storeResponse.customer.associatedStoreId.toString();
  const initialData = await getCachedStoreProducts(storeId, 1, 16, {
    categories: [],
    sortBy: "default",
  });

  return <ProductsSection storeId={storeId} initialData={initialData} />;
}