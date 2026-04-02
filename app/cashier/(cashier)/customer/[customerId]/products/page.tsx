import { CustomerIdParams } from "@/types/cashier/customer";
import getStoreAndProduct from "@/actions/customer/ProductAndStore/getAssociatedStore";
import { searchProducts } from "@/actions/common/searchProducts.action"; // adjust path if needed
import { SearchResultsClient } from "@/components/customer/search/SearchResultsClient";
import { redirect } from "next/navigation";
import { getCustomerDataAction } from "@/actions/customer/User.action";
import { getCartItemsCount } from "@/actions/customer/ProductAndStore/Cart.Action";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const CustomerProducts = async ({ params }: CustomerIdParams) => {
  const recievedParams = await params;
  const customerId = recievedParams.customerId;

  const [response, customerDataResponse, cartCount] = await Promise.all([
    getStoreAndProduct(customerId),
    getCustomerDataAction(customerId),
    getCartItemsCount(customerId),
  ]);

if (!response.success) {
  throw new Error("Request failed");
}

  // Pull storeId — adjust the field name if your response shape differs
  const storeId = response.storeId ?? response.products?.[0]?.storeId ?? "";
  return (
    <>
      <div className="flex items-center gap-2 md:pl-30 lg:pl-40 pt-2">
        <Link href={`/cashier/customer/${customerId}`}>
          <Button className="rounded-full" variant="outline" size="icon">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-gray-950">
          Customer Products
        </h1>
      </div>
      <SearchResultsClient
        customerId={customerId}
        storeId={storeId}
        searchAction={searchProducts}
        customerData={customerDataResponse.customerData}
        cartCount={cartCount ?? 0}
      />
    </>
  );
};

export default CustomerProducts;
