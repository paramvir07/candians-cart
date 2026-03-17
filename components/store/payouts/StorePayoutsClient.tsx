"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getVendorPayoutsAction, SerializedStorePayout } from "@/actions/store/payouts/getStorePayouts";
import { Loader2, ReceiptText, ArrowRight, Download, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export default function StorePayoutsClient({ storeId }: { storeId: string }) {
  const router = useRouter();
  const [payouts, setPayouts] = useState<SerializedStorePayout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid">("all");
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

      const result = await getVendorPayoutsAction(storeId, filters);
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
  }, [storeId, statusFilter, dateFrom, dateTo]);

  return (
    <div className="space-y-4 border rounded-xl p-5 bg-white shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ReceiptText className="w-5 h-5 text-muted-foreground" />
          Payout History
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
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
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-35" />
            <span className="text-muted-foreground text-sm">to</span>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-35" />
          </div>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Created</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Total Earned</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Payment Proof</TableHead>
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
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No payouts found for these filters.
                </TableCell>
              </TableRow>
            ) : (
              payouts.map((payout) => (
                <TableRow 
                  key={payout._id}
                  onClick={() => router.push(`/store/payouts/${payout._id}`)}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                >
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
                  
                  <TableCell className="font-medium text-primary flex items-center gap-2">
                    {formatCurrency(payout.storePayout)}
                    {payout.additionalNote && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-50 text-xs">{payout.additionalNote}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {payout.status === "pending" ? (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Pending</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Paid</Badge>
                    )}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    {payout.paymentReciept ? (
                      <Button 
                        asChild 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => e.stopPropagation()} // Prevent row click when downloading
                      >
                         <Link href={payout.paymentReciept.url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-2" />
                            Doc
                         </Link>
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground italic mr-2">View Details</span>
                    )}
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