import { CustomerIdParams } from "@/types/cashier/customer";
import { getCustomerDataAction } from "@/actions/customer/User.action";
import WalletSwitcher from "@/components/customer/wallet/WalletSwitcher";
import WalletView from "@/components/customer/wallet/WalletView";
import { Customer } from "@/types/customer/customer";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
