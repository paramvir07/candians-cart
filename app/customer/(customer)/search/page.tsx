import SearchPageLoader from "@/components/customer/search/SearchpageLoader";
import SearchPageSkeleton from "@/components/skeletons/SearchPageSkeleton";
import { Suspense } from "react";


export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchPageLoader />
    </Suspense>
  );
}