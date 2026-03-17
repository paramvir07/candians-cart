import { getUserSession } from "@/actions/auth/getUserSession.actions";
import Store from "@/db/models/store/store.model";
import { dbConnect } from "@/db/dbConnect";
import { getSingleVendorPayoutAction } from "@/actions/store/payouts/getStorePayouts";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import StorePayoutDetailClient from "@/components/store/payouts/StorePayoutDetailClient";

export default async function PayoutDetailsPage({
  params,
}: {
  params: Promise<{ payoutId: string }>;
}) {
  const { payoutId } = await params;

  const session = await getUserSession();
  const sessionUserId = session?.user?.id;

  if (!sessionUserId) {
    return <div className="p-8 text-center">Unauthorized</div>;
  }

  await dbConnect();
  const store = await Store.findOne({ userId: sessionUserId })
    .select("_id")
    .lean();

  if (!store) {
    return <div className="p-8 text-center">Store not found.</div>;
  }

  const storeId = store._id.toString();
  const {
    data: payout,
    success,
    message,
  } = await getSingleVendorPayoutAction(payoutId, storeId);

  if (!success || !payout) {
    return (
      <div className="p-8 text-center text-red-500 space-y-4">
        <h2>{message || "Payout not found"}</h2>
        <Link href="/store/payouts" className="text-blue-500 hover:underline">
          Return to Payouts
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-300 mx-auto">
      <Link
        href="/store/payouts"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Payouts
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payout Receipt</h1>
        <p className="text-muted-foreground">
          View your detailed payment information.
        </p>
      </div>

      <StorePayoutDetailClient payout={payout} />
    </div>
  );
}
