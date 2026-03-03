import { CustomerIdParams } from "@/types/cashier/customer";

const page = async ({ params }: CustomerIdParams) => {
  const recievedParams = await params;
  const customerId = recievedParams.customerId;
  return (
    <div>customer orders</div>
  )
}

export default page;