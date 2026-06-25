import { Suspense } from "react";
import { getCategorySales } from "@/actions/store/categories/categorySales.action";
import { getStores } from "@/actions/store/getStores.actions";
import CategorySalesTableClient from "@/components/store/categories/CategorySalesTableClient";
import CategorySalesSkeleton from "@/components/skeletons/CategorySalesSkeleton";
import { getTodayVancouverBoundsUTC } from "@/lib/timezone";

export default async function AdminCategorySalesPage() {
  const { start, end } = getTodayVancouverBoundsUTC();

  // Fetch initial global data ("all")
  const initialData = await getCategorySales("all", start, end);

  // Fetch stores for the dropdown
  const storesRes = await getStores();
  const stores = storesRes.success ? storesRes.data : [];

  return (
    <div className="p-6 space-y-6 flex-1 w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Category Sales Analytics
        </h1>
        <p className="text-muted-foreground">
          View sales performance globally or filter by specific stores.
        </p>
      </div>

      <Suspense fallback={<CategorySalesSkeleton />}>
        <CategorySalesTableClient
          initialData={initialData}
          initialStoreId="all"
          isAdmin={true}
          stores={stores}
        />
      </Suspense>
    </div>
  );
}
