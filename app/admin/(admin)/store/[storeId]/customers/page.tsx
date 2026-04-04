
import { getCustomerStats } from "@/actions/admin/analytics/getCustomerStats.action";
import MainOverviewUser from "@/components/shared/users/MainOverviewUser";
import UserList from "@/components/shared/users/UserList";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const AdminStoreUsersPage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;
  const stats = await getCustomerStats(storeId);

  return (
    <>
      <Link
        href={`/admin/store/${storeId}`}
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Link>

      <div className="flex flex-col gap-5 px-4 sm:px-8">
        <div>
          <h1 className="text-2xl font-semibold">Customer Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Customers associated with this store.
          </p>
        </div>

        <MainOverviewUser
          totalUsers={stats.totalUsers}
          totalUsersChange={stats.totalUsersChange}
          totalUsersUp={stats.totalUsersUp}
          newUsersThisMonth={stats.newUsersThisMonth}
          newUsersChange={stats.newUsersChange}
          newUsersUp={stats.newUsersUp}
          activeUsers={stats.activeUsers}
          activeUsersChange={stats.activeUsersChange}
          activeUsersUp={stats.activeUsersUp}
          avgMonthlyBudget={stats.avgMonthlyBudget}
          avgBudgetChange={stats.avgBudgetChange}
          avgBudgetUp={stats.avgBudgetUp}
        />

        {/* adminMode + storeId → fetches only this store's customers */}
        <UserList adminMode={true} storeId={storeId} />  {/* http://localhost:3000/admin/store/69cdfefeaa9db6b0ab8872ed/customers */}
      </div>
    </>
  );
};

export default AdminStoreUsersPage;
