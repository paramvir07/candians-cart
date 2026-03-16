import { getProductStats } from "@/actions/admin/products/getProductStats.action";
import { StoreProductsList } from "@/components/admin/store/products/StoreProductsList";
import ProductStatCards from "@/components/shared/products/ProductStatsCards";


const AdminProductsPage = async () => {
  const stats = await getProductStats(); // no storeId = all
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-400 mx-auto p-4 sm:p-6 lg:p-8 space-y-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Inventory</h1>
        <ProductStatCards stats={stats} />
        <StoreProductsList role="admin" />
      </div>
    </div>
  );
};
export default AdminProductsPage;
