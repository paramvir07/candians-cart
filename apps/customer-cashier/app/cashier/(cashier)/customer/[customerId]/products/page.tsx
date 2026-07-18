import { CustomerIdParams } from "@canadian-cart/types/cashier/customer";
import getStoreAndProduct from "@canadian-cart/actions/customer/ProductAndStore/getAssociatedStore";
import { searchProducts } from "@canadian-cart/actions/common/searchProducts.action"; // adjust path if needed
import { SearchResultsClient } from "@canadian-cart/ui/customer/search/SearchResultsClient";
import { getCustomerDataAction } from "@canadian-cart/actions/customer/User.action";
import { getCartItemsCount } from "@canadian-cart/actions/customer/ProductAndStore/Cart.Action";
import { Suspense } from "react";

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

  const storeId = response.storeId ?? response.products?.[0]?.storeId ?? "";
  return (
    <>
      <Suspense>
        <SearchResultsClient
          isCashier={true}
          customerId={customerId}
          storeId={storeId}
          searchAction={searchProducts}
          customerData={customerDataResponse.customerData}
          cartCount={cartCount ?? 0}
        />
      </Suspense>
    </>
  );
};

export default CustomerProducts;
