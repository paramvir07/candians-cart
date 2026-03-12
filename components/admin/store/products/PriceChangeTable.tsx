"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner"; // Assuming you use Sonner based on your imports
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
import { resolvePriceChange } from "@/actions/admin/invoice/getPriceChange"; // Adjust path if needed

// --- Types ---
interface PopulatedProduct {
  _id: string;
  name: string;
  images?: { url: string; fileId: string }[];
}

interface PriceChangeLog {
  _id: string; // The ID of the subdocument
  productId: PopulatedProduct | null;
  oldPrice?: number;
  newPrice: number;
  status: "APPROVED" | "REJECTED" | "ACKNOWLEDGED" | "PENDING";
}

interface InvoiceWithChanges {
  _id: string;
  vendorName: string;
  InvoiceNumber: number;
  DateInvoiceCame: string;
  documentId: { url: string; fileId: string };
  products: PriceChangeLog[];
  createdAt: string;
}

interface PriceChangesTableProps {
  invoices: InvoiceWithChanges[];
}

const formatPrice = (cents?: number) => {
  if (cents === undefined || cents === null) return "N/A";
  return `$${(cents / 100).toFixed(2)}`;
};

export default function PriceChangesTable({ invoices }: PriceChangesTableProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithChanges | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleViewDetails = (invoice: InvoiceWithChanges) => {
    setSelectedInvoice(invoice);
    setIsSheetOpen(true);
  };

  const handleResolve = (invoiceId: string, logId: string, status: "APPROVED" | "REJECTED") => {
    startTransition(async () => {
      const result = await resolvePriceChange(invoiceId, logId, status);
      
      if (result.success) {
        toast.success(result.message);
        
        // Optimistically remove the item from the local sheet view
        if (selectedInvoice) {
            const remainingProducts = selectedInvoice.products.filter(p => p._id !== logId);
            if (remainingProducts.length === 0) {
                // If no more pending items, close sheet
                setIsSheetOpen(false); 
            } else {
                setSelectedInvoice({ ...selectedInvoice, products: remainingProducts });
            }
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
        <h3 className="text-lg font-medium">No Pending Price Changes</h3>
        <p className="text-sm text-muted-foreground">
          You are all caught up! There are no pending approvals.
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
              <TableHead>Pending Actions</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice._id}>
                <TableCell>
                  {format(new Date(invoice.createdAt), "MMM dd, yyyy")}
                </TableCell>
                <TableCell className="font-medium">{invoice.vendorName}</TableCell>
                <TableCell>#{invoice.InvoiceNumber}</TableCell>
                <TableCell>
                  <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600 text-white">
                    {invoice.products.length} Pending
                  </Badge>
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
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Review Price Changes</SheetTitle>
            <SheetDescription>
              Approve or reject the following price updates.
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
                    {/* The Direct Link You Requested */}
                    <Button asChild variant="secondary" size="sm" className="w-full sm:w-auto">
                        <Link href={selectedInvoice.documentId.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open Full Invoice Document
                        </Link>
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden relative aspect-3/4 w-full bg-muted">
                  <Image
                    src={selectedInvoice.documentId.url}
                    alt="Invoice Document"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>

              {/* Price Changes List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  Pending Approvals
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
                            <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center text-xs shrink-0">
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

                        {/* Approve/Reject Action Buttons */}
                        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
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