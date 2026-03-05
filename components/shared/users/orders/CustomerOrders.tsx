import Navbar from "@/components/customer/landing/Navbar";
import { getOrders } from "@/actions/customer/ProductAndStore/Order.Action";
import { OrderWithProductsClient } from "@/types/customer/OrdersClient";
import OrdersHistoryClient from "./OrdersHistoryClient";
import NoOrdersScreen from "@/components/customer/orderHistory/NoOrdersScreen";

const CustomerOrders = async ({ customerId }: { customerId?: string }) => {
  const PrevOrders = await getOrders(customerId);

  if (!PrevOrders || PrevOrders.length === 0) {
    return (
      <>
        {!customerId && <Navbar />}
        <NoOrdersScreen customerId={customerId} />
      </>
    );
  }

  return (
    <>
      {!customerId && <Navbar />}
      <OrdersHistoryClient
        customerId={customerId}
        orders={PrevOrders as OrderWithProductsClient[]}
      />
    </>
  );
};

export default CustomerOrders;
