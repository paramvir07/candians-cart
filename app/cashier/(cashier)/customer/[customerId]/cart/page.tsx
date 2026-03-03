import CustomerCart from "@/components/shared/users/CustomerCart";
import { CustomerIdParams } from "@/types/cashier/customer";

const page = async ({ params }: CustomerIdParams) => {
  const recievedParams = await params;
  const customerId = recievedParams.customerId;
  return <CustomerCart customerId={customerId} />;
};

export default page;
