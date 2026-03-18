import { CashCollectionList } from "@/components/shared/cash-collection/CashCollectionList";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function AdminStoreCashPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  return (
    <>
      <Link
        href={`/admin/store/${storeId}`}
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Link>
      <div className="space-y-5 p-4 sm:p-6 lg:p-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cash Collection</h1>
          <p className="text-sm text-gray-500 mt-1">
            Cash orders and wallet top-ups for this store
          </p>
        </div>
        <CashCollectionList storeId={storeId} role="admin" />
      </div>
    </>
  );
}
