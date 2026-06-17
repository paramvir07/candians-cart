import { Suspense } from "react";
import { getCategorySales } from "@/actions/store/categories/categorySales.action";
import CategorySalesTableClient from "@/components/store/categories/CategorySalesTableClient";
import CategorySalesSkeleton from "@/components/skeletons/CategorySalesSkeleton";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import Store from "@/db/models/store/store.model";

// 1. Data-fetching Server Component
async function CategorySalesWrapper({ storeId }: { storeId: string }) {
  // Default to 'Today'
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  // Fetch initial data on the server
  const initialData = await getCategorySales(storeId, startOfDay, endOfDay);

  return (
    <CategorySalesTableClient initialData={initialData} storeId={storeId} />
  );
}

// 2. Main Page Component (Static parts render instantly)
export default async function StoreCategoriesPage() {
  const session = await getUserSession();
  const store = await Store.findOne({ userId: session.user.id })
    .select("_id")
    .lean();

  if (!store) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight text-destructive">
          Store Not Found
        </h1>
        <p className="text-muted-foreground">
          We couldn't find a store associated with this account.
        </p>
      </div>
    );
  }

  const storeIdString = store._id.toString();
  return (
    <div className="p-6 space-y-6 flex-1 w-full">
      {/* Static Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Category Sales</h1>
        <p className="text-muted-foreground">
          View your store's sales performance broken down by category.
        </p>
      </div>

      {/* Suspense Boundary: Shows Skeleton while CategorySalesWrapper is awaiting data */}
      <Suspense fallback={<CategorySalesSkeleton />}>
        <CategorySalesWrapper storeId={storeIdString} />
      </Suspense>
    </div>
  );
}
