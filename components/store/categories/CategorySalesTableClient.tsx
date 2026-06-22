"use client";

import React, { useState, useTransition } from "react";
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
import { DatePickerWithRange } from "@/components/admin/analytics/reciept/DatePickerWithRange";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getTodayVancouverBoundsUTC,
  getVancouverDayBoundsUTC,
} from "@/lib/timezone";

interface CategorySalesTableClientProps {
  initialData: ICategorySales[];
  storeId: string;
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

export default function CategorySalesTableClient({
  initialData,
  storeId,
}: CategorySalesTableClientProps) {
  const [data, setData] = useState<ICategorySales[]>(initialData);
  const [filterType, setFilterType] = useState<string>("today");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isPending, startTransition] = useTransition();

  const [selectedCategory, setSelectedCategory] =
    useState<ICategorySales | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFilterChange = (value: string) => {
    setFilterType(value);

    if (value === "today") {
      const { start, end } = getTodayVancouverBoundsUTC();
      fetchFilteredData(start, end);
      return;
    }
    if (value === "week") {
      const today = new Date();
      const { start } = getVancouverDayBoundsUTC(startOfWeek(today));
      const { end } = getVancouverDayBoundsUTC(endOfWeek(today));
      fetchFilteredData(start, end);
      return;
    }
    if (value === "month") {
      const today = new Date();
      const { start } = getVancouverDayBoundsUTC(startOfMonth(today));
      const { end } = getVancouverDayBoundsUTC(endOfMonth(today));
      fetchFilteredData(start, end);
      return;
    }
    if (value === "custom") return;
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      const { start } = getVancouverDayBoundsUTC(range.from);
      const { end } = getVancouverDayBoundsUTC(range.to);
      fetchFilteredData(start, end);
    }
  };

  const fetchFilteredData = (start: Date, end: Date) => {
    startTransition(async () => {
      const result = await getCategorySales(storeId, start, end);
      setData(result);
    });
  };

  const openDetails = (categoryData: ICategorySales) => {
    setSelectedCategory(categoryData);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Select value={filterType} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="custom">Select Time Period</SelectItem>
          </SelectContent>
        </Select>

        {filterType === "custom" && (
          <DatePickerWithRange
            date={dateRange}
            setDate={handleDateRangeChange}
          />
        )}

        {isPending && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner className="w-4 h-4" />
            <span>Updating...</span>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="rounded-md border relative">
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
                  <TableCell>{Number(row.totalSales).toFixed(2)}</TableCell>
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
                        <TableCell>{Number(detail.sales).toFixed(2)}</TableCell>
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
