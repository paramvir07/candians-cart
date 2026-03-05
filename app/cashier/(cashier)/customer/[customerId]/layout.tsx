import { getCartItemsCount } from "@/actions/customer/ProductAndStore/Cart.Action";
import { getCustomerDataAction } from "@/actions/customer/User.action";
import CashierSidebar from "@/components/cashier/CashierSlidebar";
import { CustomerBanner } from "@/components/cashier/CustomerBanner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Customer } from "@/types/customer/customer";

type Props = {
  children: React.ReactNode;
  params: Promise<{ customerId: string }>;
};

export default async function RootLayout({ children, params }: Props) {
  const { customerId } = await params;

  const [customerDataResponse, cartCount] = await Promise.all([
    getCustomerDataAction(customerId),
    getCartItemsCount(customerId),
  ]);

  const customerData: Customer = customerDataResponse.customerData;

  const sidebarData = {
    id: customerId,
    name: customerData.name,
    cartCount,
  };

  return (
    <>
      <CashierSidebar customerData={sidebarData} />
      <TooltipProvider>
        <div className="flex-1 md:ml-18 flex flex-col min-h-screen">
          {/* Persistent customer identity strip */}
          <CustomerBanner
            customer={customerData}
            customerId={customerId}
            cartCount={cartCount ?? 0}
          />

          {/* Page content */}
          <div className="flex-1 p-6">{children}</div>
        </div>
      </TooltipProvider>
    </>
  );
}
