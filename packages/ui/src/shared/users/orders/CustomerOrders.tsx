import { Suspense } from "react";
import Navbar from "@canadian-cart/ui/customer/landing/Navbar";
import { getAllOrders, getOrders } from "@canadian-cart/actions/customer/ProductAndStore/Order.Action";
import { OrderWithProductsClient } from "@canadian-cart/types/customer/OrdersClient";
import NoOrdersScreen from "@canadian-cart/ui/customer/orderHistory/NoOrdersScreen";
import OrdersHistorySkeleton from "@canadian-cart/ui/skeletons/OrderHistorySkeleton";
import OrdersHistoryClient from "./OrdersHistoryClient";

async function OrdersLoader({
  customerId,
  allOrders,
  immigrationRole,
}: {
  customerId?: string;
  allOrders?: boolean;
  immigrationRole?: boolean;
}) {
  // Fetch initial Page 1
  const response = allOrders
    ? await getAllOrders(1, 5)
    : await getOrders(customerId, 1, 5);

  const parsedResponse = response as { data?: OrderWithProductsClient[], totalPages?: number } | null;
  const ordersData = parsedResponse?.data ?? [];
  const totalPages = parsedResponse?.totalPages ?? 1;

  if (ordersData.length === 0) {
    return <NoOrdersScreen customerId={customerId} allOrders={allOrders} />;
  }

  return (
    <OrdersHistoryClient
      customerId={customerId}
      allOrders={allOrders}
      initialOrders={ordersData}
      initialTotalPages={totalPages}
      immigrationRole={immigrationRole}
    />
  );
}

const CustomerOrders = ({
  customerId,
  allOrders,
  immigrationRole,
}: {
  customerId?: string;
  allOrders?: boolean;
  immigrationRole?: boolean;
}) => {
  const showNavbar = !customerId && !allOrders;

  return (
    <>
      {showNavbar && <Navbar />}
      <Suspense fallback={<OrdersHistorySkeleton withNavbar={false} />}>
        <OrdersLoader customerId={customerId} allOrders={allOrders} immigrationRole={immigrationRole} />
      </Suspense>
    </>
  );
};

export default CustomerOrders;