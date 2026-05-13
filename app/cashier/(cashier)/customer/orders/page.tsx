import CashierSidebar from "@/components/cashier/CashierSlidebar";
import CustomerOrders from "@/components/shared/users/orders/CustomerOrders";
import { notFound } from "next/navigation";

const page = () => {
  notFound();
  return (
    <>
      {/* <CashierSidebar />
      <CustomerOrders allOrders={true} /> */}
    </>
  );
};

export default page;
