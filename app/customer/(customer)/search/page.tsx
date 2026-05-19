import SearchPageLoader from "@/components/customer/search/SearchpageLoader";
import SearchPageSkeleton from "@/components/skeletons/SearchPageSkeleton";
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