import { getCustomerDataAction } from "@/actions/customer/User.action";
import Navbar from "@/components/customer/landing/Navbar";
import WalletSwitcher from "@/components/customer/wallet/WalletSwitcher";
import WalletView from "@/components/customer/wallet/WalletView";
import { Customer } from "@/types/customer/customer";

const Page = async () => {
  const customerDataResponse = await getCustomerDataAction();
  const customerData: Customer = customerDataResponse.customerData;
  return (
    <div>
      <Navbar />
      <WalletSwitcher />
      <WalletView customerData={customerData} />
    </div>
  );
};

export default Page;
