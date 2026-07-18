import { getProductStats } from "@canadian-cart/actions/admin/products/getProductStats.action";
import { StoreProductsList } from "@canadian-cart/ui/admin/store/products/StoreProductsList";
import ProductStatCards from "@canadian-cart/ui/shared/products/ProductStatsCards";
import { BurstCacheButton } from "@canadian-cart/ui/admin/store/BurstAllProductCache";
import { burstGlobalProductsCache } from "@canadian-cart/actions/admin/products/burstGlobalCache.action";

const AdminProductsPage = async () => {
  const stats = await getProductStats(); // no storeId = all
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-400 mx-auto p-4 sm:p-6 lg:p-8 space-y-5">
        <ProductStatCards stats={stats} />
        <BurstCacheButton
          action={burstGlobalProductsCache}
          label="Burst All Product Caches"
        />
        <StoreProductsList role="admin" />
      </div>
    </div>
  );
};
export default AdminProductsPage;
