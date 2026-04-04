
import { getMyStoreCustomers } from "@/actions/customer/User.action";
import MainOverviewUser from "@/components/shared/users/MainOverviewUser";
import UserList from "@/components/shared/users/UserList";
import { Customer } from "@/types/customer/customer";

const page = async () => {
  const { myStoreCustomersData } = await getMyStoreCustomers();

  const customers: Customer[] = myStoreCustomersData ?? [];

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Total Users
  const totalUsers = customers.length;

  const totalUsersLastMonth = customers.filter(
    (c: Customer) => new Date(c.createdAt) <= endOfLastMonth,
  ).length;

  const totalUsersChange =
    totalUsersLastMonth > 0
      ? (
          ((totalUsers - totalUsersLastMonth) / totalUsersLastMonth) *
          100
        ).toFixed(1)
      : "0";
  const totalUsersUp = totalUsers >= totalUsersLastMonth;

  // New Users this month
  const newUsersThisMonth = customers.filter(
    (c: Customer) => new Date(c.createdAt) >= startOfMonth,
  ).length;

  const newUsersLastMonth = customers.filter((c: Customer) => {
    const d = new Date(c.createdAt);
    return d >= startOfLastMonth && d <= endOfLastMonth;
  }).length;

  const newUsersChange =
    newUsersLastMonth > 0
      ? (
          ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) *
          100
        ).toFixed(1)
      : "0";
  const newUsersUp = newUsersThisMonth >= newUsersLastMonth;

  // Active Users = walletBalance > 0
  // walletBalance is stored in cents — any value > 0 cents means active, comparison is still valid
  const activeUsersThisMonth = customers.filter(
    (c: Customer) => c.walletBalance > 0,
  ).length;

  const activeUsersLastMonth = customers.filter(
    (c: Customer) =>
      new Date(c.createdAt) <= endOfLastMonth && c.walletBalance > 0,
  ).length;

  const activeUsersChange =
    activeUsersLastMonth > 0
      ? (
          ((activeUsersThisMonth - activeUsersLastMonth) /
            activeUsersLastMonth) *
          100
        ).toFixed(1)
      : "0";
  const activeUsersUp = activeUsersThisMonth >= activeUsersLastMonth;

  // Avg Monthly Budget — stored in cents, divide by 100 to get dollars before display
  const avgMonthlyBudgetCents =
    customers.length > 0
      ? customers.reduce(
          (sum: number, c: Customer) => sum + (c.monthlyBudget ?? 0),
          0,
        ) / customers.length
      : 0;

  const lastMonthCustomers: Customer[] = customers.filter(
    (c: Customer) => new Date(c.createdAt) <= endOfLastMonth,
  );

  const avgMonthlyBudgetLastMonthCents =
    lastMonthCustomers.length > 0
      ? lastMonthCustomers.reduce(
          (sum: number, c: Customer) => sum + (c.monthlyBudget ?? 0),
          0,
        ) / lastMonthCustomers.length
      : 0;

  // % change: dividing both by 100 cancels out — ratio is identical, no change needed here
  const avgBudgetChange =
    avgMonthlyBudgetLastMonthCents > 0
      ? (
          ((avgMonthlyBudgetCents - avgMonthlyBudgetLastMonthCents) /
            avgMonthlyBudgetLastMonthCents) *
          100
        ).toFixed(1)
      : "0";
  const avgBudgetUp = avgMonthlyBudgetCents >= avgMonthlyBudgetLastMonthCents;

  // Convert cents → dollars for display
  const avgMonthlyBudget = avgMonthlyBudgetCents / 100;

  return (
    <div className="flex flex-col gap-5 px-8">
      <h1 className="text-2xl mt-5 font-semibold">Customer Management</h1>
      <p className="text-sm text-muted-foreground">
        View all customers for your store.
      </p>
      <MainOverviewUser
        totalUsers={totalUsers}
        totalUsersChange={totalUsersChange}
        totalUsersUp={totalUsersUp}
        newUsersThisMonth={newUsersThisMonth}
        newUsersChange={newUsersChange}
        newUsersUp={newUsersUp}
        activeUsers={activeUsersThisMonth}
        activeUsersChange={activeUsersChange}
        activeUsersUp={activeUsersUp}
        avgMonthlyBudget={avgMonthlyBudget}
        avgBudgetChange={avgBudgetChange}
        avgBudgetUp={avgBudgetUp}
      />
      <UserList myStoreCustomersData={myStoreCustomersData} userRole="store"/>  {/* http://localhost:3000/store/customers */}
    </div>
  );
};

export default page;
