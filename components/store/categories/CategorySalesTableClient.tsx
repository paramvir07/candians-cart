"use client";

import React, { useState, useTransition, useCallback } from "react";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  endOfDay,
} from "date-fns";
import { type DateRange } from "react-day-picker";
import {
  ICategorySales,
  ICategorySaleDetail,
} from "@/types/store/categorySales.types";
import { getCategorySales } from "@/actions/store/categories/categorySales.action";
import { StoreDocument } from "@/types/store/store";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DatePickerWithRange } from "@/components/admin/analytics/reciept/DatePickerWithRange";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getTodayVancouverBoundsUTC,
  getVancouverDayBoundsUTC,
} from "@/lib/timezone";

interface CategorySalesTableClientProps {
  initialData: ICategorySales[];
  initialStoreId: string;
  isAdmin?: boolean;
  stores?: StoreDocument[];
}

const formatToPST = (utcDateString: string) => {
  const date = new Date(utcDateString);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Vancouver",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(date)
    .replace(/\//g, "-");
};

const formatSales = (sales: number, isMeasuredByWeight?: boolean) => {
  const n = Number(sales);
  return isMeasuredByWeight ? n.toFixed(2) : Math.round(n).toString();
};

export default function CategorySalesTableClient({
  initialData,
  initialStoreId,
  isAdmin = false,
  stores = [],
}: CategorySalesTableClientProps) {
  const [data, setData] = useState<ICategorySales[]>(initialData);
  const [storeId, setStoreId] = useState<string>(initialStoreId || "all");
  const [filterType, setFilterType] = useState<string>("today");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isPending, startTransition] = useTransition();

  const [selectedCategory, setSelectedCategory] =
    useState<ICategorySales | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Helper to get dates so we can reuse it for both filter changes and store changes
  const getDatesForFilter = useCallback(
    (type: string, range?: DateRange): { start: Date; end: Date } | null => {
      const today = new Date();
      if (type === "today") {
        return getTodayVancouverBoundsUTC();
      }
      if (type === "week") {
        return {
          start: getVancouverDayBoundsUTC(startOfWeek(today)).start,
          end: getVancouverDayBoundsUTC(endOfWeek(today)).end,
        };
      }
      if (type === "month") {
        return {
          start: getVancouverDayBoundsUTC(startOfMonth(today)).start,
          end: getVancouverDayBoundsUTC(endOfMonth(today)).end,
        };
      }
      if (type === "custom" && range?.from && range?.to) {
        return {
          start: getVancouverDayBoundsUTC(range.from).start,
          end: getVancouverDayBoundsUTC(range.to).end,
        };
      }
      return null;
    },
    [],
  );

  const fetchFilteredData = (start: Date, end: Date, targetStoreId: string) => {
    startTransition(async () => {
      const result = await getCategorySales(targetStoreId, start, end);
      setData(result);
    });
  };

  const handleFilterChange = (value: string) => {
    setFilterType(value);
    const dates = getDatesForFilter(value, dateRange);
    if (dates) fetchFilteredData(dates.start, dates.end, storeId);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      const { start } = getVancouverDayBoundsUTC(range.from);
      const { end } = getVancouverDayBoundsUTC(range.to);
      fetchFilteredData(start, end, storeId);
    }
  };

  const handleStoreChange = (newStoreId: string) => {
    setStoreId(newStoreId);
    const dates = getDatesForFilter(filterType, dateRange);
    if (dates) fetchFilteredData(dates.start, dates.end, newStoreId);
  };

  const openDetails = (categoryData: ICategorySales) => {
    setSelectedCategory(categoryData);
    setIsDialogOpen(true);
  };

  const selectedStoreName =
    storeId === "all"
      ? "All Stores (Global)"
      : stores.find((s) => s._id.toString() === storeId)?.name ||
        "Select a store";

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        {/* Admin Store Selector Dropdown */}
        {isAdmin && stores.length > 0 && (
          <div className="space-y-2.5 w-full sm:w-64">
            <Label className="text-sm font-medium">Select Store</Label>
            <Select value={storeId} onValueChange={handleStoreChange}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select Store">
                  {selectedStoreName}
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

        <div className="space-y-2.5 w-full sm:w-45">
          {isAdmin && <Label className="text-sm font-medium">Timeframe</Label>}
          <Select value={filterType} onValueChange={handleFilterChange}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="custom">Select Time Period</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filterType === "custom" && (
          <div className="space-y-2.5">
            {isAdmin && (
              <Label className="text-sm font-medium">Custom Range</Label>
            )}
            <DatePickerWithRange
              date={dateRange}
              setDate={handleDateRangeChange}
            />
          </div>
        )}

        {isPending && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground pb-2 ml-2">
            <Spinner className="w-4 h-4" />
            <span>Updating...</span>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="rounded-md border relative mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Total Sales</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-5 w-30" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-10" />
                  </TableCell>
                  <TableCell className="text-right flex justify-end">
                    <Skeleton className="h-8 w-25" />
                  </TableCell>
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24">
                  No sales found for this period.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row.category}>
                  <TableCell className="font-medium">{row.category}</TableCell>
                  <TableCell>
                    {formatSales(row.totalSales, row.isMeasuredInWeight)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDetails(row)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Details Popup Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent showCloseButton={true}>
          <DialogHeader>
            <DialogTitle>
              {selectedCategory?.category} Sales Details
            </DialogTitle>
            <DialogDescription>
              Detailed breakdown of items sold in this category.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-75 overflow-y-auto mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Date (PST)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedCategory?.details.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No details available.
                    </TableCell>
                  </TableRow>
                ) : (
                  selectedCategory?.details.map(
                    (detail: ICategorySaleDetail) => (
                      <TableRow key={detail.productId}>
                        <TableCell>{detail.productName}</TableCell>
                        <TableCell>
                          {formatSales(detail.sales, detail.isMeasuredInWeight)}
                        </TableCell>
                        <TableCell>{formatToPST(detail.date)}</TableCell>
                      </TableRow>
                    ),
                  )
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
