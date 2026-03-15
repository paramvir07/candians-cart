import AllStorePayoutsHistory from "@/components/admin/analytics/reciept/AllStorePayoutsHistory";

export default function GlobalStorePayoutsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-400 mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Global Store Payouts</h1>
        <p className="text-muted-foreground">
          View, filter, and manage payouts across all vendors on the platform.
        </p>
      </div>

      {/* Render the global history table */}
      <AllStorePayoutsHistory />
    </div>
  );
}