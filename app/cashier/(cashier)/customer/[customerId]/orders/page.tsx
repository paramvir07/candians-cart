import CustomerOrders from "@/components/shared/users/orders/CustomerOrders";
import { CustomerIdParams } from "@/types/cashier/customer";

const page = async ({ params }: CustomerIdParams) => {
  const recievedParams = await params;
  const customerId = recievedParams.customerId;
  return <CustomerOrders customerId={customerId} />;
};

export default page;
