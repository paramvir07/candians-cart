import getStoreAndProduct from "@/actions/customer/ProductAndStore/getAssociatedStore";
import { searchProducts } from "@/actions/common/searchProducts.action";
import { SearchResultsClient } from "@/components/customer/search/SearchResultsClient";
import { getCustomerDataAction } from "@/actions/customer/User.action";
import { getCartItemsCount } from "@/actions/customer/ProductAndStore/Cart.Action";

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
    <SearchResultsClient
      storeId={storeId}
      searchAction={searchProducts}
      customerData={customerDataResponse.customerData}
      cartCount={cartCount ?? 0}
    />
  );
}