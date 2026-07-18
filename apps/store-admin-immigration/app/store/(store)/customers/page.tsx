import {
  getMyStoreCustomers,
  getMyStoreCustomerStats,
} from "@canadian-cart/actions/customer/User.action";
import MainOverviewUser from "@canadian-cart/ui/shared/users/MainOverviewUser";
import UserList from "@canadian-cart/ui/shared/users/UserList";
import { SerializedCustomer } from "@canadian-cart/types/customer/customer";

export const dynamic = "force-dynamic";

const ITEMS_PER_PAGE = 12;

const page = async () => {
  const [{ myStoreCustomersData, pagination }, stats] = await Promise.all([
    getMyStoreCustomers(1, ITEMS_PER_PAGE),
    getMyStoreCustomerStats(),
  ]);

const customers: SerializedCustomer[] =
  myStoreCustomersData?.map((customer) => ({
    ...customer,

    _id: customer._id.toString(),
    userId: customer.userId.toString(),
    associatedStoreId: customer.associatedStoreId.toString(),
    referralCodeId: customer.referralCodeId.toString(),

    myreferralCodeId: customer.myreferralCodeId?.toString(),

    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
    lastOrderDate: customer.lastOrderDate,
  })) ?? [];

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
