"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  getStorePayoutsAction,
  SerializedPayout,
} from "@/actions/admin/reciept/getPayouts";
import { Loader2, ReceiptText, ArrowRight, UploadCloud } from "lucide-react";
import Link from "next/link";

const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

export default function StorePayoutHistory({ storeId }: { storeId: string }) {
  const [payouts, setPayouts] = useState<SerializedPayout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid">(
    "all",
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchPayouts = async () => {
    setIsLoading(true);
    try {
      const filters = {
        status: statusFilter,
        from: dateFrom ? new Date(dateFrom) : undefined,
        to: dateTo ? new Date(dateTo) : undefined,
      };

      const result = await getStorePayoutsAction(storeId, filters);
      if (result.success && result.data) {
        setPayouts(result.data);
      } else {
        toast.error(result.message || "Failed to load payouts.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, statusFilter, dateFrom, dateTo]);

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="space-y-4 border rounded-xl p-5 bg-white shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ReceiptText className="w-5 h-5 text-muted-foreground" />
          Payout History
        </h3>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={statusFilter}
            onValueChange={(val: any) => setStatusFilter(val)}
          >
            <SelectTrigger className="w-32.5">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-35"
            />
            <span className="text-muted-foreground text-sm">to</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-35"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Created</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Store Payout</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : payouts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-muted-foreground"
                >
                  No payouts found for these filters.
                </TableCell>
              </TableRow>
            ) : (
              payouts.map((payout) => (
                <TableRow key={payout._id}>
                  <TableCell className="text-sm">
                    {format(new Date(payout.createdAt), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      {format(new Date(payout.startDate), "MMM dd")}
                      <ArrowRight className="w-3 h-3" />
                      {format(new Date(payout.endDate), "MMM dd")}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-primary">
                    {formatCurrency(payout.storePayout)}
                  </TableCell>
                  <TableCell>
                    {payout.status === "pending" ? (
                      <Badge
                        variant="outline"
                        className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50"
                      >
                        Pending
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50"
                      >
                        Paid
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {/* Placeholder for your future requirement */}
                    <Button asChild variant="secondary" size="sm">
                      <Link
                        href={`/admin/store/${storeId}/payout-reciepts/${payout._id}`}
                      >
                        {payout.status === "pending"
                          ? "Mark as Paid"
                          : "View Details"}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
