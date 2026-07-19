import { getRecentCashActivities } from "@canadian-cart/actions/common/getCashActivities.action";
import { getStoreDashboardData } from "@canadian-cart/actions/store/getStoreDashboard.actions";
import CashActivityWidget from "@canadian-cart/ui/shared/cash-collection/CashActivityWidget";
import StoreDashRecentOrders from "@canadian-cart/ui/store/dashboard/StoreDashRecentOrders";
import StoreDashRecentPayouts from "@canadian-cart/ui/store/dashboard/StoreDashRecentPayouts";
import StoreDashStatCards from "@canadian-cart/ui/store/dashboard/StoreDashStatsCards";

export default async function StoreDashboardPage() {
  const { stats, recentOrders, recentPayouts, storeId } =
    await getStoreDashboardData();
  const cashActivities = await getRecentCashActivities(storeId, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-350 mx-auto p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
        {/* Page heading */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of your store's performance
          </p>
        </div>

        {/* 4 stat cards — Products, Orders, Revenue, Users */}
        <StoreDashStatCards stats={stats} storeId={storeId} />

        {/* Recent Orders + Recent Payouts side by side */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
          <StoreDashRecentOrders orders={recentOrders} limit={5} />
          <StoreDashRecentPayouts payouts={recentPayouts} limit={5} />
          <CashActivityWidget
            activities={cashActivities}
            viewAllHref="/store/cash-collection"
            showStore={false}
            limit={5}
          />
          {/* <CustomerAdvertisements /> */}
        </div>
      </div>
    </div>
  );
}
