import { CashCollectionList } from "@/components/shared/cash-collection/CashCollectionList";


export default function AdminCashCollectionPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Cash Collection</h1>
          <p className="text-sm text-gray-500 mt-1">All cash orders and wallet top-ups across every store</p>
        </div>
        <CashCollectionList role="admin" />
      </div>
    </div>
  );
}
