import { getMyStoreCustomers } from "@/actions/customer/User.action";
import CashierSidebar from "@/components/cashier/CashierSlidebar";
import UserList from "@/components/shared/users/UserList";

const page = async () => {
  const { myStoreCustomersData } = await getMyStoreCustomers();
  return (
    <>
      <CashierSidebar />
      <div className="flex-1 p-6 md:ml-18">
        <UserList
          myStoreCustomersData={myStoreCustomersData}
          userRole="cashier"
        />  {/* http://localhost:3000/cashier */}
      </div>
    </>
  );
};

export default page;
