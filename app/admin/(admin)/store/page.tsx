import { allStoreDataAction } from "@/actions/admin/analytics/store/allStoresData.action";
import StoreInfo from "@/components/admin/analytics/store/GetStore";
import RecentPayoutReceipts from "@/components/admin/analytics/store/RecentPayoutReciepts";
import RecentOrders from "@/components/admin/analytics/store/RecentOrders";
import StatCards from "@/components/admin/analytics/store/StatsCards";

const StorePage = async () => {
  const { stats, recentOrders, recentPayoutReceipts } =
    await allStoreDataAction();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Page Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-1">
              Admin Panel
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Store Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Overview of all stores, orders and payouts
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

export default StorePage;
