import getStoreAndProduct from "@/actions/customer/ProductAndStore/getAssociatedStore";
import { searchProducts } from "@/actions/common/searchProducts.action"; // adjust path if needed
import { SearchResultsClient } from "@/components/customer/search/SearchResultsClient";
import { redirect } from "next/navigation";

export default async function SearchPage() {

  const response = await getStoreAndProduct();

  if (!response.success) {
    redirect("/customer");
  }

  // Pull storeId — adjust the field name if your response shape differs
  const storeId =
    (response as any).storeId ?? (response.products?.[0] as any)?.storeId ?? "";

  return (
    <SearchResultsClient storeId={storeId} searchAction={searchProducts} />
  );
}
