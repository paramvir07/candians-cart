import { Suspense } from "react";
import Navbar from "@/components/customer/landing/Navbar";
import { getAllOrders, getOrders } from "@/actions/customer/ProductAndStore/Order.Action";
import { OrderWithProductsClient } from "@/types/customer/OrdersClient";
import NoOrdersScreen from "@/components/customer/orderHistory/NoOrdersScreen";
import OrdersHistorySkeleton from "@/components/skeletons/OrderHistorySkeleton";
import OrdersHistoryClient from "./OrdersHistoryClient";

async function OrdersLoader({
  customerId,
  allOrders,
}: {
  customerId?: string;
  allOrders?: boolean;
}) {
  const PrevOrders = allOrders
    ? await getAllOrders()
    : await getOrders(customerId);

  if (!PrevOrders || PrevOrders.length === 0) {
    return <NoOrdersScreen customerId={customerId} allOrders={allOrders} />;
  }

  return (
    <OrdersHistoryClient
      customerId={customerId}
      allOrders={allOrders}
      orders={PrevOrders as OrderWithProductsClient[]}
    />
  );
}

const CustomerOrders = ({
  customerId,
  allOrders,
}: {
  customerId?: string;
  allOrders?: boolean;
}) => {
  const showNavbar = !customerId && !allOrders;

  return (
    <>
      {showNavbar && <Navbar />}
      <Suspense
        fallback={<OrdersHistorySkeleton withNavbar={false} />}
      >
        <OrdersLoader customerId={customerId} allOrders={allOrders} />
      </Suspense>
    </>
  );
};

export default CustomerOrders;