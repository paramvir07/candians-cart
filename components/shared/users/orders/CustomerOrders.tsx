import Navbar from "@/components/customer/landing/Navbar";
import { getAllOrders, getOrders } from "@/actions/customer/ProductAndStore/Order.Action";
import { OrderWithProductsClient } from "@/types/customer/OrdersClient";
import OrdersHistoryClient from "./OrdersHistoryClient";
import NoOrdersScreen from "@/components/customer/orderHistory/NoOrdersScreen";

const CustomerOrders = async ({
  customerId,
  allOrders,
}: {
  customerId?: string;
  allOrders?: boolean;
}) => {
  const PrevOrders = allOrders
    ? await getAllOrders()
    : await getOrders(customerId);
  if (!PrevOrders || PrevOrders.length === 0) {
    return (
      <>
        {!customerId && !allOrders && <Navbar />}
        <NoOrdersScreen customerId={customerId} allOrders={allOrders} />
      </>
    );
  }

  return (
    <>
      {!customerId && !allOrders && <Navbar />}
      <OrdersHistoryClient
        customerId={customerId}
        allOrders={allOrders}
        orders={PrevOrders as OrderWithProductsClient[]}
      />
    </>
  );
};

export default CustomerOrders;
