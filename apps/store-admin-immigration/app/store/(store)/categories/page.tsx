import { Suspense } from "react";
import { getCategorySales } from "@canadian-cart/actions/store/categories/categorySales.action";
import CategorySalesTableClient from "@canadian-cart/ui/store/categories/CategorySalesTableClient";
import CategorySalesSkeleton from "@canadian-cart/ui/skeletons/CategorySalesSkeleton";
import { getUserSession } from "@canadian-cart/actions/auth/getUserSession.actions";
import Store from "@canadian-cart/db/models/store/store.model";
import { getTodayVancouverBoundsUTC } from "@canadian-cart/lib/timezone";

// 1. Data-fetching Server Component
async function CategorySalesWrapper({ storeId }: { storeId: string }) {
  // Default to 'Today'
  const { start, end } = getTodayVancouverBoundsUTC();

  // Fetch initial data on the server
  const initialData = await getCategorySales(storeId, start, end);

  return (
    <CategorySalesTableClient
      initialData={initialData}
      initialStoreId={storeId}
    />
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
