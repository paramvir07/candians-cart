"use client";

import { useState, useEffect } from "react";
import { type DateRange } from "react-day-picker";
import { startOfDay, endOfDay } from "date-fns";
import { useDebounce } from "use-debounce";

import {
  getRecieptDataByDateRange,
  AggregatedReciept,
} from "@/actions/admin/reciept/generateReciept";
import {
  getStores,
  GetStoresResponse,
} from "@/actions/store/getStores.actions";
import { StoreDocument } from "@/types/store/store";
import { DownloadButton } from "./DownloadButton";
import { DatePickerWithRange } from "./DatePickerWithRange";
import { saveStorePayoutAction } from "@/actions/admin/reciept/saveStorePayout";
import { toast } from "sonner";

// Utility Imports
import { fmt } from "@/lib/fomatPrice";

// Shadcn UI Imports
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Store,
  ShoppingCart,
  TrendingUp,
  Receipt,
  Save,
  PanelsTopLeft,
} from "lucide-react";

export default function RecieptComponent({
  initialStoreId,
  userRole,
}: {
  initialStoreId?: string;
  userRole?: "store" | "admin";
}) {
  const storeRole = userRole === "store";
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [storeId, setStoreId] = useState<string>(initialStoreId || "all");

  const [debouncedDate] = useDebounce(date, 500);
  const [debouncedStoreId] = useDebounce(storeId, 500);

  const [receipts, setReceipts] = useState<AggregatedReciept[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Track saving state per receipt card (using the store ID as the key)
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});

  const [stores, setStores] = useState<StoreDocument[]>([]);
  const [isStoresLoading, setIsStoresLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStores() {
      try {
        const response: GetStoresResponse = await getStores();
        if (response.success) {
          setStores(response.data);
        } else {
          console.error("Failed to load stores:", response.error);
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
      } finally {
        setIsStoresLoading(false);
      }
    }
    fetchStores();
  }, []);

  // 2. Fetch Aggregated Data when Debounced Values Change
  useEffect(() => {
    async function fetchData() {
      // Use the debounced date rather than the immediate state
      if (debouncedDate?.from && debouncedDate?.to) {
        setIsLoading(true);
        setFetchError(null);

        // Calculate boundaries relative to the user's local timezone
        const startDate = startOfDay(debouncedDate.from);
        const endDate = endOfDay(debouncedDate.to);

        const selectedStore =
          debouncedStoreId === "all" ? undefined : debouncedStoreId;

        try {
          const data = await getRecieptDataByDateRange({
            startDate,
            endDate,
            storeId: selectedStore,
          });

          setReceipts(data);
          setFetchError(null);
        } catch (error: unknown) {
          console.error("Failed to fetch receipt data:", error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : "An unexpected error occurred while fetching receipts.";

          toast.error(errorMessage);
          setReceipts(null);
          setFetchError(errorMessage);
        } finally {
          setIsLoading(false);
        }
      } else {
        setReceipts(null);
      }
    }

    fetchData();
  }, [debouncedDate, debouncedStoreId]);

  const handleSavePayout = async (receipt: AggregatedReciept) => {
    // Safety check using debouncedDate ensures we are saving the exact dates the receipt represents
    if (!receipt._id || !debouncedDate?.from || !debouncedDate?.to) return;

    // Set loading state for this specific store's button
    setIsSaving((prev) => ({ ...prev, [receipt._id as string]: true }));

    try {
      // Re-create the exact UTC boundaries used to query
      const startDate = startOfDay(debouncedDate.from);
      const endDate = endOfDay(debouncedDate.to);

      const res = await saveStorePayoutAction(receipt, startDate, endDate);

      if (res.success) {
        toast.success("Payout saved successfully!");
      } else {
        toast.error(res.error || "Failed to save payout");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSaving((prev) => ({ ...prev, [receipt._id as string]: false }));
    }
  };

  const hasData = receipts && receipts.length > 0;

  const fromIso = debouncedDate?.from ? debouncedDate.from.toISOString() : "";
  const toIso = debouncedDate?.to ? debouncedDate.to.toISOString() : "";

  const selectedStoreName =
    storeId === "all"
      ? "All Stores (Global)"
      : stores.find((s) => s._id.toString() === storeId)?.name ||
        "Select a store";

  return (
    <Card className="w-full mt-6 shadow-sm border-muted">
      <CardHeader className="bg-muted/30 border-b pb-6">
        <CardTitle className="text-xl flex items-center gap-2">
          <Store className="h-5 w-5 text-primary" />
          {!storeRole && initialStoreId
            ? "Store Settlement Generator"
            : storeRole && initialStoreId
              ? "Generate Your Store Settlement"
              : "Platform Settlement Generator"}
        </CardTitle>
        <CardDescription>
          Generate and download settlement receipts{" "}
          {!storeRole && initialStoreId
            ? "for this store"
            : storeRole && initialStoreId
              ? "for your store"
              : "across stores or platform-wide"}
          .
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 space-y-8">
        {/* Controls Section */}
        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-end">
          {/* Only show the store selector if an initialStoreId was NOT provided */}
          {!initialStoreId && (
            <div className="space-y-2.5 w-full sm:w-64">
              <Label className="text-sm font-medium">Select Store</Label>
              <Select
                disabled={isStoresLoading}
                value={storeId}
                onValueChange={setStoreId}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Loading stores...">
                    {isStoresLoading ? "Loading stores..." : selectedStoreName}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores (Global)</SelectItem>
                  {stores.map((store) => (
                    <SelectItem
                      key={store._id.toString()}
                      value={store._id.toString()}
                    >
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2.5 flex-1">
            <Label className="text-sm font-medium">Date Range</Label>
            <div>
              <DatePickerWithRange date={date} setDate={setDate} />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-62.5 w-full rounded-xl" />
          </div>
        )}

        {/* Results Section */}
        {!isLoading && hasData && debouncedDate?.from && debouncedDate?.to && (
          <div className="space-y-6 pt-2 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                {debouncedStoreId === "all"
                  ? "Platform-wide Aggregation"
                  : storeRole
                  ? "Your store Data"
                  : "Store-specific Data"}
              </h2>
              <DownloadButton
                storeId={debouncedStoreId === "all" ? "" : debouncedStoreId}
                startDateIso={fromIso}
                endDateIso={toIso}
              />
            </div>

            {/* Render nicely formatted settlement cards for each record */}
            <div className="space-y-6">
              {receipts.map((r, index) => {
                const rIdString = r._id?.toString();

                const sName = rIdString
                  ? stores.find((s) => s._id.toString() === rIdString)?.name ||
                    "Store Data"
                  : "Platform Total";

                const isCurrentlySaving = rIdString
                  ? isSaving[rIdString]
                  : false;

                return (
                  <Card
                    key={rIdString || index}
                    className="overflow-hidden border-border/50 shadow-sm relative"
                  >
                    {/* Header showing store name and save button */}
                    <div className="px-6 py-4 border-b flex items-center justify-between bg-muted/5">
                      <h3 className="font-semibold">{sName}</h3>
                      {rIdString && !storeRole && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleSavePayout(r)}
                          disabled={isCurrentlySaving}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {isCurrentlySaving ? "Saving..." : "Save Payout"}
                        </Button>
                      )}
                    </div>

                    {/* Settlement Top Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 border-b bg-muted/10">
                      <div className="p-4 flex flex-col justify-center">
                        <span className="text-xs font-medium mb-1 uppercase tracking-wider">
                          Total Revenue
                        </span>
                        <span className="text-2xl font-bold">
                          {fmt(r.totalRevenue)}
                        </span>
                      </div>
                      <div className="p-4 flex flex-col justify-center">
                        <span className="text-xs text-blue-700 font-medium mb-1 uppercase tracking-wider">
                          Store Payout
                        </span>
                        <span className="text-2xl font-bold text-blue-700">
                          {fmt(r.storePayout)}
                        </span>
                      </div>
                      <div className="p-4 flex flex-col justify-center">
                        <span className="text-xs text-primary font-medium mb-1 uppercase tracking-wider">
                          {storeRole ? "Store Profit" : "Platform Profit"}
                        </span>
                        <span className="text-2xl font-bold text-primary">
                          {fmt(storeRole ? r.storeProfit : r.platformProfit)}
                        </span>
                      </div>
                      <div className="p-4 flex flex-col justify-center">
                        <span className="text-xs text-foreground font-medium mb-1 uppercase tracking-wider">
                          Total Orders
                        </span>
                        <span className="text-2xl font-bold text-foreground">
                          {r.orderCount}
                        </span>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                        {/* Column 1: Order Breakdown */}
                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2 text-foreground text-lg">
                            <ShoppingCart className="w-4 h-4 text-foreground" />{" "}
                            Order Breakdown
                          </h4>
                          <div className="space-y-2.5 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">
                                Total Base Price
                              </span>
                              <span className="text-muted-foreground">
                                {fmt(r.totalBasePrice)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">
                                Total GST
                              </span>
                              <span className="font-medium text-muted-foreground">
                                {fmt(r.totalGST)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">
                                Total PST
                              </span>
                              <span className="font-medium text-muted-foreground">
                                {fmt(r.totalPST)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">
                                Total Disposable Fees
                              </span>
                              <span className="font-medium text-muted-foreground">
                                {fmt(r.totalDisposableFee)}
                              </span>
                            </div>

                            <h2 className="font-semibold flex items-center gap-2 pt-2 text-lg text-blue-700">
                              <Store className="w-4 h-4 text-blue-700" /> Store
                              Breakdown
                            </h2>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">
                                Total Base Price
                              </span>
                              <span className="font-medium text-muted-foreground">
                                {fmt(r.totalBasePrice)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">
                                Store GST
                              </span>
                              <span className="font-medium text-muted-foreground">
                                {fmt(r.storebasetaxGST + r.storeMarkupTax)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">
                                Store PST
                              </span>
                              <span className="font-medium text-muted-foreground">
                                {fmt(r.storebasetaxPST)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">
                                Total Disposable Fees
                              </span>
                              <span className="font-medium text-muted-foreground">
                                {fmt(r.totalDisposableFee)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-blue-700">
                                Store Profit (50%)
                              </span>
                              <span className="font-medium text-blue-700">
                                {fmt(r.storeProfit)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-blue-700">
                                Total
                              </span>
                              <span className="font-medium text-blue-700">
                                {fmt(
                                  r.storePayout +
                                    r.totalWalletTopUpCashCollected,
                                )}
                              </span>
                            </div>
                            <Separator/>
                            <div className="flex justify-between items-center text-black font-medium">
                              <span>Total Cash Collected</span>
                              <span>
                                -{fmt(r.totalWalletTopUpCashCollected)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center font-medium text-blue-700 mt-2">
                              <span>Total Store Payout</span>
                              <span>{fmt(r.storePayout)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Column 2: Margins & Profits */}
                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2 text-foreground/80 text-lg">
                            <TrendingUp className="w-4 h-4" /> Profit & Margins
                          </h4>
                          <div className="space-y-2.5 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-bold">
                                Total Profit Margin
                              </span>
                              <span className="font-bold">
                                {fmt(r.profitMargin)}
                              </span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between items-center font-medium text-pink-700">
                              <span>Subsidy</span>
                              <span>{fmt(r.totalSubsidy)}</span>
                            </div>
                            <div className="flex justify-between items-center font-medium text-blue-700">
                              <span>Store Profit (50%)</span>
                              <span>{fmt(r.storeProfit)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-medium text-primary mt-2">
                              <span>Platform Profit</span>
                              <span>{fmt(r.platformProfit)}</span>
                            </div>
                            {!storeRole && (
                              <div className="flex justify-between items-center text-sm font-medium text-primary mt-2">
                                <span>Platform Fee</span>
                                <span>{fmt(r.totalPlatformFee)}</span>
                              </div>
                            )}

                            <h4 className="font-semibold flex items-center gap-2 text-primary pt-2 text-lg">
                              <PanelsTopLeft className="w-4 h-4 text-primary" />{" "}
                              Platform Breakdown
                            </h4>
                            <div className="space-y-1 pt-1">
                              <div className="flex justify-between items-center text-muted-foreground">
                                <span>Platform GST</span>
                                <span>{fmt(r.platformMarkupGSTTax)}</span>
                              </div>
                              <div className="flex justify-between items-center text-muted-foreground">
                                <span>Platform PST</span>
                                <span>{fmt(r.platformMarkupPSTTax)}</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center text-sm font-medium text-primary mt-2">
                              <span>Platform Profit</span>
                              <span>{fmt(r.platformProfit)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty States */}
        {!isLoading && fetchError && (
          <Alert
            variant="destructive"
            className="bg-destructive/10 border-destructive/20"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-semibold">Action Required</AlertTitle>
            <AlertDescription className="mt-2 text-destructive/90">
              {fetchError}
            </AlertDescription>
          </Alert>
        )}

        {!isLoading &&
          debouncedDate?.from &&
          debouncedDate?.to &&
          !hasData &&
          !fetchError && (
            <Alert className="bg-muted/50 border-dashed">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No data found</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                No completed orders found for the selected store and date range.
                Try adjusting your filters.
              </AlertDescription>
            </Alert>
          )}

        {!isLoading &&
          (!debouncedDate?.from || !debouncedDate?.to) &&
          !fetchError && (
            <Alert className="bg-muted/30 border-dashed">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <AlertTitle className="text-muted-foreground">
                Waiting for selection
              </AlertTitle>
              <AlertDescription className="text-muted-foreground">
                Please select a date range above to generate settlement data.
              </AlertDescription>
            </Alert>
          )}
      </CardContent>
    </Card>
  );
}
