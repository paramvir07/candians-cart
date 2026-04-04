import getStoreAndProduct from "@/actions/customer/ProductAndStore/getAssociatedStore";
import { searchProducts } from "@/actions/common/searchProducts.action"; // adjust path if needed
import { SearchResultsClient } from "@/components/customer/search/SearchResultsClient";
import { redirect } from "next/navigation";
import { getCustomerDataAction } from "@/actions/customer/User.action";
import { getCartItemsCount } from "@/actions/customer/ProductAndStore/Cart.Action";

export default async function SearchPage() {

  const [response, customerDataResponse, cartCount] = await Promise.all([
    getStoreAndProduct(),
    getCustomerDataAction(),
    getCartItemsCount(),
  ])

  if (!response.success) {
    throw new Error("Something went wrong")
  }

  // Pull storeId — adjust the field name if your response shape differs
  const storeId =
    response.storeId ?? response.products?.[0]?.storeId ?? "";

  return (
    <SearchResultsClient 
    storeId={storeId} 
    searchAction={searchProducts}
    // Adding cartitems and customer info
    customerData = {customerDataResponse.customerData}
    cartCount = {cartCount ?? 0}
    />
  );
}
