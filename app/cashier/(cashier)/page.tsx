import { getMyStoreCustomers } from "@/actions/customer/User.action";
import CashierSidebar from "@/components/cashier/CashierSlidebar";
import UserList from "@/components/shared/users/UserList";

const page = async () => {
  const { myStoreCustomersData } = await getMyStoreCustomers();
  return (
    <>
      <CashierSidebar />
      <UserList
        myStoreCustomersData={myStoreCustomersData}
        userRole="cashier"
      />
    </>
  );
};

export default page;
