import { getCartItemsCount } from "@/actions/customer/ProductAndStore/Cart.Action";
import { getCustomerDataAction } from "@/actions/customer/User.action";
import CashierSidebar from "@/components/cashier/CashierSlidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Customer } from "@/types/customer/customer";

type Props = {
  children: React.ReactNode;
  params: Promise<{ customerId: string }>;
};

export default async function RootLayout({ children, params }: Props) {
  const { customerId } = await params;

  const [customerDataResponse,CartItemTotal] = await Promise.all([
    getCustomerDataAction(customerId),
    getCartItemsCount(customerId)
  ]);

  const customerData: Customer = customerDataResponse.customerData;

  const sidebarData = {
    id: customerId,
    name: customerData.name,
    walletBalance: customerData.walletBalance,
    giftWalletBalance:customerData.giftWalletBalance,
    CartCount:CartItemTotal
  };

  return (
    <>
      <CashierSidebar customerData={sidebarData} />
      <TooltipProvider>
          {children}
      </TooltipProvider>
    </>
  );
}
