import {
  getMyStoreCustomers,
  getMyStoreCustomerStats,
} from "@/actions/customer/User.action";
import MainOverviewUser from "@/components/shared/users/MainOverviewUser";
import UserList from "@/components/shared/users/UserList";
import { SerializedCustomer } from "@/types/customer/customer";

export const dynamic = "force-dynamic";

const ITEMS_PER_PAGE = 12;

const page = async () => {
  const [{ myStoreCustomersData, pagination }, stats] = await Promise.all([
    getMyStoreCustomers(1, ITEMS_PER_PAGE),
    getMyStoreCustomerStats(),
  ]);

  const customers: SerializedCustomer[] =
    (myStoreCustomersData as SerializedCustomer[]) ?? [];

  return (
    <div className="flex flex-col gap-5 px-8">
      <h1 className="text-2xl mt-5 font-semibold">Customer Management</h1>

      <p className="text-sm text-muted-foreground">
        View all customers for your store.
      </p>

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

      <UserList
        myStoreCustomersData={customers}
        initialPagination={pagination}
        userRole="store"
      />
    </div>
  );
};

export default page;
