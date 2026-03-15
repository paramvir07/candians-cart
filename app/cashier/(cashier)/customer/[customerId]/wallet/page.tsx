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
      <div className="flex items-center gap-2 md:pl-12 pt-4">
        <Link href={`/cashier/customer/${customerId}`}>
          <Button className="rounded-full" variant="outline" size="icon">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-950">
          Customer Wallet
        </h1>
      </div>
      <WalletSwitcher/>
      <WalletView customerData={customerData} customerId={customerId} />
    </div>
  );
};

export default CustomerWallet;
