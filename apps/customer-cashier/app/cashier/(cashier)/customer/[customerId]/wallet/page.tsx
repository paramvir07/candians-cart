import { CustomerIdParams } from "@canadian-cart/types/cashier/customer";
import { getCustomerDataAction } from "@canadian-cart/actions/customer/User.action";
import WalletSwitcher from "@canadian-cart/ui/customer/wallet/WalletSwitcher";
import WalletView from "@canadian-cart/ui/customer/wallet/WalletView";
import { Customer } from "@canadian-cart/types/customer/customer";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@canadian-cart/ui/ui/button";

const CustomerWallet = async ({ params }: CustomerIdParams) => {
  const recievedParams = await params;
  const customerId = recievedParams.customerId;

  const customerDataResponse = await getCustomerDataAction(customerId);
  const customerData: Customer = customerDataResponse.customerData;
  return (
    <div>
      <WalletSwitcher/>
      <WalletView customerData={customerData} customerId={customerId} />
    </div>
  );
};

export default CustomerWallet;
