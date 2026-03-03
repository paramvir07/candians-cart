import { CustomerIdParams } from "@/types/cashier/customer";

const CustomerProducts = async({ params }: CustomerIdParams) => {
  const recievedParams = await params;
  const customerId = recievedParams.customerId;
  return (
    <div>CustomerProducts</div>
  )
}

export default CustomerProducts