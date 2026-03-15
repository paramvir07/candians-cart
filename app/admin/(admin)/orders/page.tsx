import { getOrderStats } from "@/actions/admin/orders/getOrderStats.action";
import { OrdersList } from "@/components/admin/store/OrdersList";


const AdminOrdersPage = async () => {
  const stats = await getOrderStats(); // no storeId = all stores
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">All orders across every store</p>
        </div>
        <OrdersList stats={stats} />
      </div>
    </div>
  );
};
export default AdminOrdersPage;
