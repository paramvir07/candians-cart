
import { getOrderStats } from "@/actions/admin/orders/getOrderStats.action";
import { OrdersList } from "@/components/admin/store/OrdersList";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const AdminStoreOrdersPage = async ({ params }: { params: Promise<{ storeId: string }> }) => {
  const { storeId } = await params;
  const stats = await getOrderStats(storeId);
  return (
    <>
      <Link href={`/admin/store/${storeId}`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Link>
      <div className="space-y-5 p-4 sm:p-6 lg:p-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Orders for this store</p>
        </div>
        <OrdersList storeId={storeId} stats={stats} />
      </div>
    </>
  );
};
export default AdminStoreOrdersPage;
