import { getMyStoreCustomers } from "@/actions/customer/User.action";
import CashierSidebar from "@/components/cashier/CashierSlidebar";
import UserList from "@/components/shared/users/UserList";

const ITEMS_PER_PAGE = 12;

const page = async () => {
  const { myStoreCustomersData, pagination } = await getMyStoreCustomers(
    1,
    ITEMS_PER_PAGE,
  );

  return (
    <>
      <CashierSidebar />
      <div className="flex-1 p-6 md:ml-18">
        <UserList
          myStoreCustomersData={myStoreCustomersData}
          initialPagination={pagination}
          userRole="cashier"
        />{" "}
        {/* http://localhost:3000/cashier */}
      </div>
    </>
  );
};

export default page;
