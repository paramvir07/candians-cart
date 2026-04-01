"use client";

import { useState, useEffect } from "react";
import { type DateRange } from "react-day-picker";
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
} from "lucide-react";

export default function RecieptComponent({
  initialStoreId,
}: {
  initialStoreId?: string;
}) {
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [receipts, setReceipts] = useState<AggregatedReciept[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Track saving state per receipt card (using the store ID as the key)
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});

  const [stores, setStores] = useState<StoreDocument[]>([]);
  const [storeId, setStoreId] = useState<string>(initialStoreId || "all");
  const [isStoresLoading, setIsStoresLoading] = useState(true);

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

  useEffect(() => {
    async function fetchData() {
      if (date?.from && date?.to) {
        setIsLoading(true);

        const startDate = new Date(date.from);
        startDate.setUTCHours(0, 0, 0, 0);

        const endDate = new Date(date.to);
        endDate.setUTCHours(23, 59, 59, 999);

        const selectedStore = storeId === "all" ? undefined : storeId;

        try {
          const data = await getRecieptDataByDateRange({
            startDate,
            endDate,
            storeId: selectedStore,
          });

          setReceipts(data);
        } catch (error) {
          console.error("Failed to fetch receipt data:", error);
          setReceipts(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setReceipts(null);
      }
    }

    fetchData();
  }, [date, storeId]);

  const handleSavePayout = async (receipt: AggregatedReciept) => {
    if (!receipt._id || !date?.from || !date?.to) return;

    // Set loading state for this specific store's button
    setIsSaving((prev) => ({ ...prev, [receipt._id as string]: true }));

    try {
      // Re-create the exact UTC boundaries used to query
      const startDate = new Date(date.from);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(date.to);
      endDate.setUTCHours(23, 59, 59, 999);

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
  const fromIso = date?.from ? date.from.toISOString() : "";
  const toIso = date?.to ? date.to.toISOString() : "";

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
          {initialStoreId
            ? "Store Settlement Generator"
            : "Platform Settlement Generator"}
        </CardTitle>
        <CardDescription>
          Generate and download settlement receipts{" "}
          {initialStoreId ? "for this store" : "across stores or platform-wide"}
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
        {!isLoading && hasData && date?.from && date?.to && (
          <div className="space-y-6 pt-2 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                {storeId === "all"
                  ? "Platform-wide Aggregation"
                  : "Store-specific Data"}
              </h2>
              <DownloadButton
                storeId={storeId === "all" ? "" : storeId}
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
                      {rIdString && (
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
                        <span className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">
                          Total Customer Paid
                        </span>
                        <span className="text-2xl font-bold">
                          {fmt(r.totalCustomerPaid)}
                        </span>
                      </div>
                      <div className="p-4 flex flex-col justify-center">
                        <span className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">
                          Store Payout
                        </span>
                        <span className="text-2xl font-bold text-green-600">
                          {fmt(r.storePayout)}
                        </span>
                      </div>
                      <div className="p-4 flex flex-col justify-center">
                        <span className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">
                          Platform Profit
                        </span>
                        <span className="text-2xl font-bold text-blue-600">
                          {fmt(r.platformProfit)}
                        </span>
                      </div>
                      <div className="p-4 flex flex-col justify-center">
                        <span className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">
                          Total Orders
                        </span>
                        <span className="text-2xl font-bold">
                          {r.orderCount}
                        </span>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                        {/* Column 1: Order Breakdown */}
                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2 text-foreground/80">
                            <ShoppingCart className="w-4 h-4 text-primary" />{" "}
                            Order Breakdown
                          </h4>
                          <div className="space-y-2.5 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">
                                Total Base Price
                              </span>
                              <span className="font-medium">
                                {fmt(r.totalBasePrice)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">
                                Total GST
                              </span>
                              <span className="font-medium text-red-600">
                                {fmt(r.totalGST)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">
                                Total PST
                              </span>
                              <span className="font-medium text-red-600">
                                {fmt(r.totalPST)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">
                                Disposable Fees
                              </span>
                              <span className="font-medium">
                                {fmt(r.totalDisposableFee)}
                              </span>
                            </div>
                            {r.totalSubsidy > 0 && (
                              <div className="flex justify-between items-center text-orange-600">
                                <span>Subsidies Applied</span>
                                <span>-{fmt(r.totalSubsidy)}</span>
                              </div>
                            )}

                            <div className="flex justify-between items-center font-medium text-foreground">
                              <span>Total Cash Collected (From Orders)</span>
                              <span>{fmt(r.totalOrderCashCollected)}</span>
                            </div>
                            <div className="flex justify-between items-center font-medium text-foreground">
                              <span>
                                Total Cash Collected (From Wallet Topups)
                              </span>
                              <span>
                                {fmt(r.totalWalletTopUpCashCollected)}
                              </span>
                            </div>

                            {/* --- FIXED: Base Tax UI Breakdown --- */}
                            <Separator className="my-2" />
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">
                                Store Tax Portion (GST)
                              </span>
                              <span className="font-medium">
                                {fmt(r.storebasetaxGST)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">
                                Store Tax Portion (PST)
                              </span>
                              <span className="font-medium">
                                {fmt(r.storebasetaxPST)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center font-semibold text-foreground mt-2">
                              <span>Store Fixed Value (SFV)</span>
                              <span>{fmt(r.storeFixedValue)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Column 2: Margins & Profits */}
                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2 text-foreground/80">
                            <TrendingUp className="w-4 h-4 text-primary" />{" "}
                            Profit & Margins
                          </h4>
                          <div className="space-y-2.5 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">
                                Gross Margin
                              </span>
                              <span className="font-medium">
                                {fmt(r.grossMargin)}
                              </span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between items-center font-medium text-emerald-600">
                              <span>Store Profit</span>
                              <span>{fmt(r.storeProfit)}</span>
                            </div>
                            <div className="flex justify-between items-center font-medium text-red-600">
                              <span>Total Cash Collected</span>
                              <span>-{fmt(r.totalCashCollected)}</span>
                            </div>

                            <div className="flex justify-between items-center font-medium text-blue-600 mt-2">
                              <span>Total Store Payout</span>
                              <span>{fmt(r.storePayout)}</span>
                            </div>

                            {/* --- FIXED: Platform Breakdown UI --- */}
                            <Separator className="my-2 bg-primary/20" />
                            <div className="flex justify-between items-center text-sm font-medium text-slate-700">
                              <span>Platform Markup Tax</span>
                              <span>{fmt(r.platformMarkuptax)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-medium text-blue-700">
                              <span>Platform Profit</span>
                              <span>{fmt(r.platformProfit)}</span>
                            </div>
                            <div className="flex justify-between items-center font-bold text-base text-green-700 mt-2">
                              <span>Platform Commission</span>
                              <span>{fmt(r.platformCommision)}</span>
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
        {!isLoading && date?.from && date?.to && !hasData && (
          <Alert className="bg-muted/50 border-dashed">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No data found</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              No completed orders found for the selected store and date range.
              Try adjusting your filters.
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && (!date?.from || !date?.to) && (
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
