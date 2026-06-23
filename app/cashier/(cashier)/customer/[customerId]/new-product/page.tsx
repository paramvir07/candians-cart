import CashierCreateProductForm from "@/components/cashier/CashierCreateProductForm";
import { CustomerIdParams } from "@/types/cashier/customer";

const page = async ({ params }: CustomerIdParams) => {
  const recievedParams = await params;
  const customerId = recievedParams.customerId;
  return <CashierCreateProductForm customerId={customerId} />;
};

export default page;