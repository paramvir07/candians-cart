import { Suspense } from "react";
import Navbar from "@canadian-cart/ui/customer/landing/Navbar";
import BudgetPacksSkeleton from "@canadian-cart/ui/skeletons/BudgetPacksSkeleton";
import BudgetPacksLoader from "@canadian-cart/ui/customer/budgetpacks/BudgetpackLoader";
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Budget Packs",
}

export default function Page() {
  return (
    <div>
      <Navbar />
      <Suspense fallback={<BudgetPacksSkeleton />}>
        <BudgetPacksLoader />
      </Suspense>
    </div>
  );
}