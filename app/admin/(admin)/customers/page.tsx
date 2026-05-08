
import { getCustomerStats } from "@/actions/admin/analytics/getCustomerStats.action";
import MainOverviewUser from "@/components/shared/users/MainOverviewUser";
import UserList from "@/components/shared/users/UserList";

const AdminAllCustomersPage = async () => {
  const stats = await getCustomerStats();

  return (
    <div className="flex flex-col gap-5 px-4 sm:px-8 py-6">
      <div>
        <h1 className="text-2xl font-semibold">Customer Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All customers across every store on the platform.
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

      <UserList adminMode={true} /> 
    </div>
  );
};

export default AdminAllCustomersPage;
