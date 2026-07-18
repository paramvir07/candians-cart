import CustomerOrders from "@canadian-cart/ui/shared/users/orders/CustomerOrders";
import { CustomerIdParams } from "@canadian-cart/types/cashier/customer";

const page = async ({ params }: CustomerIdParams) => {
  const recievedParams = await params;
  const customerId = recievedParams.customerId;
  return <CustomerOrders customerId={customerId} />;
};

export default page;
