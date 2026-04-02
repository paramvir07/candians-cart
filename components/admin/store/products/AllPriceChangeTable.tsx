"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Receipt, ArrowRight, Check, X, ExternalLink, Loader2, Store } from "lucide-react";
import { resolvePriceChange, SerializedGlobalInvoiceWithChanges } from "@/actions/admin/invoice/getPriceChange";

interface AllPriceChangesTableProps {
  invoices: SerializedGlobalInvoiceWithChanges[];
}

const formatPrice = (cents?: number) => {
  if (cents === undefined || cents === null) return "N/A";
  return `$${(cents / 100).toFixed(2)}`;
};

export default function AllPriceChangesTable({ invoices }: AllPriceChangesTableProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<SerializedGlobalInvoiceWithChanges | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleViewDetails = (invoice: SerializedGlobalInvoiceWithChanges) => {
    setSelectedInvoice(invoice);
    setIsSheetOpen(true);
  };

  const handleResolve = (invoiceId: string, logId: string, status: "APPROVED" | "REJECTED") => {
    startTransition(async () => {
      const result = await resolvePriceChange(invoiceId, logId, status);
      
      if (result.success) {
        toast.success(result.message);
        
        if (selectedInvoice) {
            const updatedProducts = selectedInvoice.products.map(p => 
                p._id === logId ? { ...p, status } : p
            );
            setSelectedInvoice({ ...selectedInvoice, products: updatedProducts });
        }
      } else {
        toast.error(result.message);
      }
    });
  };

  if (!invoices || invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg border-dashed">
        <Receipt className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-lg font-medium">No Invoices Found</h3>
        <p className="text-sm text-muted-foreground">
          There are no price change logs to display yet.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* TABLE */}
      <div className="rounded-md border bg-white">

  {/* DESKTOP TABLE */}
  <div className="hidden md:block overflow-x-auto">
    <Table className="min-w-175">
      <TableHeader>
        <TableRow>
          <TableHead>Date Added</TableHead>
          <TableHead>Store</TableHead>
          <TableHead>Vendor</TableHead>
          <TableHead>Invoice #</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {invoices.map((invoice) => {
          const pendingCount = invoice.products.filter(p => p.status === "PENDING").length;
          const totalCount = invoice.products.length;

          return (
            <TableRow key={invoice._id}>
              <TableCell>
                {format(new Date(invoice.createdAt), "MMM dd, yyyy")}
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">
                    {invoice.store?.name || "Unknown Store"}
                  </span>
                </div>
              </TableCell>

              <TableCell className="font-medium">
                {invoice.vendorName}
              </TableCell>

              <TableCell>#{invoice.InvoiceNumber}</TableCell>

              <TableCell>
                {pendingCount > 0 ? (
                  <Badge className="bg-orange-500 text-white">
                    {pendingCount} Pending
                  </Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-800">
                    {totalCount} Resolved
                  </Badge>
                )}
              </TableCell>

              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 ml-auto"
                  onClick={() => handleViewDetails(invoice)}
                >
                  <Eye className="w-4 h-4" />
                  Review
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </div>

  {/* MOBILE CARDS */}
  <div className="md:hidden space-y-3 p-3">
    {invoices.map((invoice) => {
      const pendingCount = invoice.products.filter(p => p.status === "PENDING").length;
      const totalCount = invoice.products.length;

      return (
        <div
          key={invoice._id}
          className="border rounded-lg p-4 bg-card space-y-3"
        >
          {/* TOP ROW */}
          <div className="flex justify-between items-start gap-2">
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">
                {format(new Date(invoice.createdAt), "MMM dd, yyyy")}
              </p>
            </div>

            {pendingCount > 0 ? (
              <Badge className="bg-orange-500 text-white">
                {pendingCount} Pending
              </Badge>
            ) : (
              <Badge className="bg-green-100 text-green-800">
                {totalCount} Resolved
              </Badge>
            )}
          </div>

          {/* STORE */}
          <div>
            <p className="text-sm text-muted-foreground">Store</p>
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold">
                {invoice.store?.name || "Unknown Store"}
              </span>
            </div>
          </div>

          {/* VENDOR + INVOICE */}
          <div className="flex justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Vendor</p>
              <p className="font-medium">{invoice.vendorName}</p>
            </div>

            <div className="text-right">
              <p className="text-sm text-muted-foreground">Invoice</p>
              <p className="font-medium">#{invoice.InvoiceNumber}</p>
            </div>
          </div>

          {/* ACTION */}
          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => handleViewDetails(invoice)}
          >
            <Eye className="w-4 h-4" />
            Review
          </Button>
        </div>
      );
    })}
  </div>

</div>

      {/* SHEET */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl h-screen flex flex-col p-0">
          
          {/* HEADER */}
          <div className="p-6 pb-4 border-b">
            <SheetHeader>
              <SheetTitle>Review Global Price Changes</SheetTitle>
              <SheetDescription>
                View, approve, or reject updates for{" "}
                <strong className="text-primary">{selectedInvoice?.store?.name}</strong>.
              </SheetDescription>
            </SheetHeader>
          </div>

          {/* CONTENT */}
          {selectedInvoice && (
            <div className="flex-1 overflow-hidden flex flex-col">

              {/* META */}
              <div className="p-6 pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-muted/50 p-4 rounded-lg">
                  <div>
                    <span className="text-muted-foreground">Vendor: </span>
                    <span className="font-medium">{selectedInvoice.vendorName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Invoice #: </span>
                    <span className="font-medium">{selectedInvoice.InvoiceNumber}</span>
                  </div>

                  <div className="sm:col-span-2">
                    <Button asChild variant="secondary" size="sm" className="w-full sm:w-auto">
                      <Link href={selectedInvoice.documentId.url} target="_blank">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open Full Invoice Document
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              {/* PRODUCTS (SCROLL AREA) */}
              <div className="flex-1 overflow-y-auto px-6 pb-6 no-scrollbar">
                <div className="space-y-3">
                  {selectedInvoice.products.map((log) => {
                    const isNewProduct = typeof log.oldPrice !== "number";
                    const productName = log.productId?.name || "Deleted Product";
                    const productImageUrl = log.productId?.images?.[0]?.url;

                    return (
                      <div
                        key={log._id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg bg-card gap-4"
                      >
                        {/* LEFT */}
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          {productImageUrl ? (
                            <div className="relative w-12 h-12 rounded-md overflow-hidden border shrink-0">
                              <Image src={productImageUrl} alt={productName} fill className="object-cover" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center text-xs shrink-0">
                              No Img
                            </div>
                          )}
                          
                          <div>
                            <p className="font-medium">{productName}</p>

                            <div className="flex items-center gap-2 mt-1 text-sm flex-wrap">
                              {isNewProduct ? (
                                <Badge className="bg-green-50 text-green-700">
                                  New Product
                                </Badge>
                              ) : (
                                <span className="line-through text-muted-foreground">
                                  {formatPrice(log.oldPrice)}
                                </span>
                              )}

                              {!isNewProduct && <ArrowRight className="w-4 h-4" />}

                              <span className="font-semibold text-primary">
                                {formatPrice(log.newPrice)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                          {log.status === "PENDING" ? (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="w-full sm:w-auto text-red-600 hover:bg-red-50"
                                disabled={isPending}
                                onClick={() => handleResolve(selectedInvoice._id, log._id, "REJECTED")}
                              >
                                <X className="w-4 h-4 mr-1" /> Reject
                              </Button>

                              <Button 
                                size="sm"
                                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                                disabled={isPending}
                                onClick={() => handleResolve(selectedInvoice._id, log._id, "APPROVED")}
                              >
                                {isPending 
                                  ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> 
                                  : <Check className="w-4 h-4 mr-1" />
                                }
                                Approve
                              </Button>
                            </>
                          ) : (
                            <Badge className={log.status === "APPROVED" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"}>
                              {log.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}