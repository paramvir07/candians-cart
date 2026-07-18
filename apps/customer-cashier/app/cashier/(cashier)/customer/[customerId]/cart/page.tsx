import CustomerCart from "@canadian-cart/ui/shared/users/CustomerCart";
import { CustomerIdParams } from "@canadian-cart/types/cashier/customer";

const page = async ({ params }: CustomerIdParams) => {
  const recievedParams = await params;
  const customerId = recievedParams.customerId;
  return <CustomerCart customerId={customerId} />;
};

export default page;