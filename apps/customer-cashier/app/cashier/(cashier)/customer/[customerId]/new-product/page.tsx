import CashierCreateProductForm from "@canadian-cart/ui/cashier/CashierCreateProductForm";
import { CustomerIdParams } from "@canadian-cart/types/cashier/customer";

const page = async ({ params }: CustomerIdParams) => {
  const recievedParams = await params;
  const customerId = recievedParams.customerId;
  return <CashierCreateProductForm customerId={customerId} />;
};

export default page;