import Navbar from "@/components/customer/landing/Navbar";
import { getOrders } from "@/actions/customer/ProductAndStore/Order.Action";
import { OrderWithProductsClient } from "@/types/customer/OrdersClient";
import OrdersHistoryClient from "./OrdersHistoryClient";

const CustomerOrders = async ({ customerId }: { customerId?: string }) => {
  const PrevOrders = await getOrders(customerId);

  if (!PrevOrders || PrevOrders.length === 0) {
    return (
      <>
        {!customerId && <Navbar />}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center">
          <p className="text-muted-foreground text-sm">No orders yet.</p>
        </div>
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
