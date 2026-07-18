import { getCustomerDataAction } from "@/actions/customer/User.action";
import WalletView from "../WalletView";


export default async function WalletViewServer() {
  const customerDataResponse = await getCustomerDataAction();

  return (
    <WalletView customerData={customerDataResponse.customerData} />
  );
}