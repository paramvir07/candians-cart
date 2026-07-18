import { getCartItemsCount } from "@canadian-cart/actions/customer/ProductAndStore/Cart.Action";
import { getCustomerDataAction } from "@canadian-cart/actions/customer/User.action";
import CashierSidebar from "@canadian-cart/ui/cashier/CashierSlidebar";
import { TooltipProvider } from "@canadian-cart/ui/ui/tooltip";
import { Customer } from "@canadian-cart/types/customer/customer";
import { getUserSession } from "@canadian-cart/actions/auth/getUserSession";
import { Cashier } from "@canadian-cart/db/models/cashier/cashier.model";

type Props = {
  children: React.ReactNode;
  params: Promise<{ customerId: string }>;
};

export default async function RootLayout({ children, params }: Props) {
  const session = await getUserSession();
  const cashierAuthId = session.user.id;
  const cashierData = await Cashier.findOne({ userId: cashierAuthId })
    .select("name email")
    .lean();

  if (!cashierData) {
    throw new Error("Cashier data not found");
  }

  const cashierProps = {
    name: cashierData.name,
    email: cashierData.email,
  };

  const { customerId } = await params;

  const [customerDataResponse, CartItemTotal] = await Promise.all([
    getCustomerDataAction(customerId),
    getCartItemsCount(customerId),
  ]);

  const customerData: Customer = customerDataResponse.customerData;

  const sidebarData = {
    id: customerId,
    name: customerData.name,
    walletBalance: customerData.walletBalance,
    giftWalletBalance: customerData.giftWalletBalance,
    CartCount: CartItemTotal,
  };

  return (
    <>
      <CashierSidebar customerData={sidebarData} cashierData={cashierProps} />
      <TooltipProvider>{children}</TooltipProvider>
    </>
  );
}
