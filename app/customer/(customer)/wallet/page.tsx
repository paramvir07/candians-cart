import { getCustomerDataAction } from "@/actions/customer/User.action";
import Navbar from "@/components/customer/landing/Navbar";
import CustomerAdvertisements from "@/components/customer/shared/CustomerAdvertisements";
import WalletSwitcher from "@/components/customer/wallet/WalletSwitcher";
import WalletView from "@/components/customer/wallet/WalletView";
import { Customer } from "@/types/customer/customer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wallet",
};

const Page = async () => {
  const customerDataResponse = await getCustomerDataAction();
  const customerData: Customer = customerDataResponse.customerData;
  
  return (
    <div>
      <Navbar />
      <WalletSwitcher />
      
      <WalletView customerData={customerData} />
      <CustomerAdvertisements maxHeight={250} />
    </div>
  );
};

export default Page;
