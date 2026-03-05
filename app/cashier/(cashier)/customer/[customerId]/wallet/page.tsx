import { CustomerIdParams } from "@/types/cashier/customer";

const CustomerWallet = async({ params }: CustomerIdParams) => {
  const recievedParams = await params;
  const customerId = recievedParams.customerId;
  return (
    <div>Customer Wallet</div>
  )
}

export default CustomerWallet;