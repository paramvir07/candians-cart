import { getProductStats } from "@/actions/admin/products/getProductStats.action";
import { StoreProductsList } from "@/components/admin/store/products/StoreProductsList";
import ProductStatCards from "@/components/shared/products/ProductStatsCards";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const AdminStoreProductsPage = async ({ params }: { params: Promise<{ storeId: string }> }) => {
  const { storeId } = await params;
  const stats = await getProductStats(storeId);
  return (
    <>
      <Link href={`/admin/store/${storeId}`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Link>
      <div className="space-y-5 p-4 sm:p-6 lg:p-8">
        <ProductStatCards stats={stats} />
        <StoreProductsList storeId={storeId} role="admin" />
      </div>
    </>
  );
};
export default AdminStoreProductsPage;
