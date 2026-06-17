"use client";

import React, { useState, useTransition } from "react";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
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
// Assuming you have this date picker component from your snippet
import { DatePickerWithRange } from "@/components/admin/analytics/reciept/DatePickerWithRange";
import { Spinner } from "@/components/ui/spinner"; // Or a loading icon

interface CategorySalesTableClientProps {
  initialData: ICategorySales[];
  storeId: string;
}

// Utility to convert UTC to PST (America/Vancouver corresponds to Pacific Time)
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

  // Dialog State
  const [selectedCategory, setSelectedCategory] =
    useState<ICategorySales | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFilterChange = (value: string) => {
    setFilterType(value);
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();

    if (value === "today") {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (value === "week") {
      startDate = startOfWeek(today);
      endDate = endOfWeek(today);
    } else if (value === "month") {
      startDate = startOfMonth(today);
      endDate = endOfMonth(today);
    } else if (value === "custom") {
      return; // Do not fetch until range is selected via date picker
    }

    fetchFilteredData(startDate, endDate);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      fetchFilteredData(range.from, range.to);
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
          <span className="text-sm text-muted-foreground animate-pulse">
            Updating...
          </span>
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
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24">
                  No sales found for this period.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row.category}>
                  <TableCell className="font-medium">{row.category}</TableCell>
                  <TableCell>{row.totalSales}</TableCell>
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
                        <TableCell>{detail.sales}</TableCell>
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
