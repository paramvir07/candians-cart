import { getMyStoreCustomers } from "@/actions/customer/User.action";
import UserList from "@/components/shared/users/UserList";

const page = async () => {
  const { myStoreCustomersData } = await getMyStoreCustomers();
  return (
    <>
      <UserList myStoreCustomersData={myStoreCustomersData} userRole="cashier"/>
    </>
  );
};

export default page;
