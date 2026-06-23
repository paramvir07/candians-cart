import CashierSidebar from "@/components/cashier/CashierSlidebar";
import UserList from "@/components/shared/users/UserList";

const page = async () => {

  return (
    <>
      <CashierSidebar />
      <div className="flex-1 p-6 md:ml-18">
        <UserList userRole="cashier" />{" "}
      </div>
    </>
  );
};

export default page;
