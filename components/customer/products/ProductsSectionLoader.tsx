// components/customer/products/ProductsSectionLoader.tsx
import { getCachedStoreProducts } from "@/actions/cache/product.cache";
import { ProductsSection } from "./ProductsSection";

export async function ProductsSectionLoader({ storeId }: { storeId: string }) {
  const initialData = await getCachedStoreProducts(storeId, 1, 16, {
    categories: [],
    sortBy: "default",
  });
  return <ProductsSection storeId={storeId} initialData={initialData} />;
}