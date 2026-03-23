import { getUserSession } from "@/actions/auth/getUserSession.actions";
import Store from "@/db/models/store/store.model";
import { dbConnect } from "@/db/dbConnect";
import StorePayoutsClient from "@/components/store/payouts/StorePayoutsClient";
import PayoutStatsCards, { PayoutStatsCardsSkeleton } from "@/components/store/payouts/PayoutStatsCards";
import { Suspense } from "react";

export default async function StorePayoutsPage() {
  const session = await getUserSession();
  const sessionUserId = session?.user?.id;

  if (!sessionUserId) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500 font-semibold">
        Unauthorized: Please log in.
      </div>
    );
  }

  await dbConnect();
  const store = await Store.findOne({ userId: sessionUserId })
    .select("_id")
    .lean();

  if (!store) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500 font-semibold text-center px-4">
        Error: Store ID could not be determined. Please make sure you have an active store associated with your account.
      </div>
    );
  }

  const storeId = store._id.toString();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-400 mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your Payouts</h1>
        <p className="text-muted-foreground">
          View your past payouts, download receipts, and track your store earnings.
        </p>
      </div>

      {/* Analytics Stats Section */}
      <Suspense fallback={<PayoutStatsCardsSkeleton />}>
         <PayoutStatsCards storeId={storeId} />
      </Suspense>

      <StorePayoutsClient storeId={storeId} />
    </div>
  );
}