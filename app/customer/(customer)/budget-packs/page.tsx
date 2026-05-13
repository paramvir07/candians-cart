import { Suspense } from "react";
import Navbar from "@/components/customer/landing/Navbar";
import BudgetPacksSkeleton from "@/components/skeletons/BudgetPacksSkeleton";
import BudgetPacksLoader from "@/components/customer/budgetpacks/BudgetpackLoader";


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