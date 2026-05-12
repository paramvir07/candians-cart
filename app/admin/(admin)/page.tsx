import { allStoreDataAction } from "@/actions/admin/analytics/store/allStoresData.action";
import { getRecentCustomers } from "@/actions/admin/analytics/getRecentCustomers.action";
import StoreInfo from "@/components/admin/analytics/store/GetStore";
import RecentPayoutReceipts from "@/components/admin/analytics/store/RecentPayoutReciepts";
import RecentOrders from "@/components/admin/analytics/store/RecentOrders";
import StatCards from "@/components/admin/analytics/store/StatsCards";
import { getRecentCashActivities } from "@/actions/common/getCashActivities.action";
import RecentCustomers from "@/components/shared/RecentCustomers";
import CashActivityWidget from "@/components/shared/cash-collection/CashActivityWidget";

const AdminDashboardPage = async () => {
  const [
    { stats, recentOrders, recentPayoutReceipts },
    recentCustomers,
    cashActivities,
  ] = await Promise.all([
    allStoreDataAction(),
    getRecentCustomers(null, 6), // all stores, 6 most recent
    getRecentCashActivities(null, 6), // all stores, 6 most recent
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-400 mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
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

        <StatCards stats={stats} />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
          <RecentOrders orders={recentOrders} />
          <RecentPayoutReceipts recentPayoutReceipts={recentPayoutReceipts} />
        </div>

        {/* Recent Customers + Cash Collection side by side */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
          <RecentCustomers
            customers={recentCustomers}
            viewAllHref="/admin/customers"
          />
          <CashActivityWidget
            activities={cashActivities}
            viewAllHref="/admin/cash-collection"
            showStore={true}
          />
        </div>
      </div>
    </div>
  );
};
export default AdminDashboardPage;
