import getStoreAndProduct from "@canadian-cart/actions/customer/ProductAndStore/getAssociatedStore";
import { searchProducts } from "@canadian-cart/actions/common/searchProducts.action";
import { SearchResultsClient } from "@canadian-cart/ui/customer/search/SearchResultsClient";
import { getCustomerDataAction } from "@canadian-cart/actions/customer/User.action";
import { getCartItemsCount } from "@canadian-cart/actions/customer/ProductAndStore/Cart.Action";
import { Suspense } from "react";
import Navbar from "../landing/Navbar";

export default async function SearchPageLoader() {
  const [response, customerDataResponse, cartCount] = await Promise.all([
    getStoreAndProduct(),
    getCustomerDataAction(),
    getCartItemsCount(),
  ]);

  if (!response.success) {
    throw new Error("Something went wrong");
  }

  const storeId =
    response.storeId ?? response.products?.[0]?.storeId ?? "";

  return (
    <Suspense>
      {/* <Navbar /> */}
      <SearchResultsClient
        storeId={storeId}
        searchAction={searchProducts}
        customerData={customerDataResponse.customerData}
        cartCount={cartCount ?? 0}
      />
    </Suspense>
  );
}