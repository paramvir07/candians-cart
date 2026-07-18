import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CategorySalesSkeleton() {
  return (
    <div className="space-y-4 w-full">
      {/* Filters Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {/* Dropdown placeholder */}
        <Skeleton className="h-10 w-45" />
        {/* Optional DatePicker placeholder */}
        <Skeleton className="h-10 w-60 hidden sm:block" />
      </div>

      {/* Table Skeleton */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Total Sales</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Render 5 skeleton rows to simulate data loading */}
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-5 w-30" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-10" />
                </TableCell>
                <TableCell className="text-right flex justify-end">
                  {/* Button placeholder */}
                  <Skeleton className="h-8 w-25" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
