import { getStorePayoutByIdAction } from "@/actions/admin/reciept/managePayout";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EditPayoutForm from "@/components/admin/analytics/reciept/EditPayoutForm";
import { DownloadSavedPayoutButton } from "@/components/admin/analytics/reciept/DownloadSavedPayoutButton";
import { SavedPayoutData } from "@/actions/admin/reciept/DownloadReciept";

export default async function PayoutDetailsPage({
  params,
}: {
  params: Promise<{ storeId: string; payoutId: string }>;
}) {
  const { storeId, payoutId } = await params;
  const { data: payout, success, message } = await getStorePayoutByIdAction(payoutId);

  if (!success || !payout) {
    return (
      <div className="p-8 text-center text-red-500">
        <h2>{message || "Payout not found"}</h2>
        <Link href={`/admin/store/${storeId}/payout-reciepts`} className="underline">Go Back</Link>
      </div>
    );
  }

  // Ensure type alignment for the client component
  const payoutData = payout as unknown as SavedPayoutData;

  return (
    <div className="max-w-300 mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <Link
        href={`/admin/store/${storeId}/payout-reciepts`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Payouts
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payout Details</h1>
          <p className="text-muted-foreground">Manage payment status, notes, and receipts for this period.</p>
        </div>
        
        {/* Render the Download PDF Button */}
        <DownloadSavedPayoutButton payout={payoutData} />
      </div>

      <EditPayoutForm initialData={payout} />
    </div>
  );
}