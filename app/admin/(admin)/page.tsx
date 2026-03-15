import { allStoreDataAction } from "@/actions/admin/analytics/store/allStoresData.action";
import StoreInfo from "@/components/admin/analytics/store/GetStore";
import RecentPayoutReceipts from "@/components/admin/analytics/store/RecentPayoutReciepts";
import RecentOrders from "@/components/admin/analytics/store/RecentOrders";
import StatCards from "@/components/admin/analytics/store/StatsCards";

const AdminDashboardPage = async() => {
  const { stats, recentOrders, recentPayoutReceipts } =
    await allStoreDataAction();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Page Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Admin Dashboard
            </h1>
            <h2 className="text-xl font-medium mt-4">Overview</h2>
            <p className="text-sm text-muted-foreground">
              Snapshot of sales, users, and platform activity.
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <StatCards stats={stats} />

        {/* Orders + Payout Receipts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
          <RecentOrders orders={recentOrders} />
          <RecentPayoutReceipts recentPayoutReceipts={recentPayoutReceipts} />
        </div>

        {/* Divider with label */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-start">
            <span className="bg-gray-50 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Store Locations
            </span>
          </div>
        </div>

        {/* Stores Grid */}
        <StoreInfo />
      </div>
    </div>
  );
};

export default AdminDashboardPage;
