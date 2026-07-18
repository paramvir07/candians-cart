import SearchPageLoader from "@canadian-cart/ui/customer/search/SearchpageLoader";
import SearchPageSkeleton from "@canadian-cart/ui/skeletons/SearchPageSkeleton";
import { Suspense } from "react";
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Search",
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchPageLoader />
    </Suspense>
  );
}