import CashierSidebar from "@/components/cashier/CashierSlidebar";
import CustomerOrders from "@/components/shared/users/orders/CustomerOrders";

const page = () => {
  return (
    <>
      <CashierSidebar />
      <CustomerOrders allOrders={true} />
    </>
  );
};

export default page;
