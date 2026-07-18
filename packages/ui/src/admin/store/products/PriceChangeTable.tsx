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
import { Eye, Receipt, ArrowRight, Check, X, ExternalLink, Loader2 } from "lucide-react";
import { resolvePriceChange, SerializedInvoiceWithChanges } from "@/actions/admin/invoice/getPriceChange";

interface PriceChangesTableProps {
  invoices: SerializedInvoiceWithChanges[];
}

const formatPrice = (cents?: number) => {
  if (cents === undefined || cents === null) return "N/A";
  return `$${(cents / 100).toFixed(2)}`;
};

export default function PriceChangesTable({ invoices }: PriceChangesTableProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<SerializedInvoiceWithChanges | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleViewDetails = (invoice: SerializedInvoiceWithChanges) => {
    setSelectedInvoice(invoice);
    setIsSheetOpen(true);
  };

  const handleResolve = (invoiceId: string, logId: string, status: "APPROVED" | "REJECTED") => {
    startTransition(async () => {
      const result = await resolvePriceChange(invoiceId, logId, status);
      
      if (result.success) {
        toast.success(result.message);
        
        // Optimistically update the status of the item instead of removing it
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
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date Added</TableHead>
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
                  <TableCell className="font-medium">{invoice.vendorName}</TableCell>
                  <TableCell>#{invoice.InvoiceNumber}</TableCell>
                  <TableCell>
                    {pendingCount > 0 ? (
                      <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600 text-white">
                        {pendingCount} Pending
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
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

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Review Price Changes</SheetTitle>
            <SheetDescription>
              View, approve, or reject the following price updates.
            </SheetDescription>
          </SheetHeader>

          {selectedInvoice ? (
            <div className="space-y-8">
              {/* Invoice Metadata & Link */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm bg-muted/50 p-4 rounded-lg">
                  <div>
                    <span className="text-muted-foreground">Vendor: </span>
                    <span className="font-medium">{selectedInvoice.vendorName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Invoice #: </span>
                    <span className="font-medium">{selectedInvoice.InvoiceNumber}</span>
                  </div>
                  <div className="col-span-2 mt-2">
                    <Button asChild variant="secondary" size="sm" className="w-full sm:w-auto">
                        <Link href={selectedInvoice.documentId.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open Full Invoice Document
                        </Link>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Price Changes List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  Invoice Products
                </h3>
                
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
                        <div className="flex items-center gap-4">
                          {productImageUrl ? (
                            <div className="relative w-12 h-12 rounded-md overflow-hidden border shrink-0">
                              <Image 
                                src={productImageUrl} 
                                alt={productName} 
                                fill 
                                className="object-cover" 
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center text-xs shrink-0 text-muted-foreground text-center leading-tight">
                              No Img
                            </div>
                          )}
                          
                          <div>
                            <p className="font-medium">{productName}</p>
                            <div className="flex items-center gap-2 mt-1 text-sm">
                              {isNewProduct ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  New Product
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground line-through decoration-red-400">
                                  {formatPrice(log.oldPrice)}
                                </span>
                              )}
                              
                              {!isNewProduct ? <ArrowRight className="w-4 h-4 text-muted-foreground" /> : null}
                              
                              <span className="font-semibold text-primary">
                                {formatPrice(log.newPrice)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status / Actions */}
                        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                          {log.status === "PENDING" ? (
                            <>
                              <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50"
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
                                  {isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                                  Approve
                              </Button>
                            </>
                          ) : (
                            <Badge variant={log.status === "APPROVED" ? "default" : "secondary"} className={log.status === "APPROVED" ? "bg-green-600 hover:bg-green-600" : "bg-gray-200 text-gray-700 hover:bg-gray-200"}>
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
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}