"use client";

import React, { useState, useTransition } from "react";

import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye,
  Receipt,
  Loader2,
  Store,
  Trash2,
  AlertTriangle,
} from "lucide-react";

// Assuming these actions exist in your codebase based on your instructions
import {
  resolvePriceChange,
  SerializedGlobalInvoiceWithChanges,
} from "@/actions/admin/invoice/getPriceChange";
import { deleteInvoice, getProductsLinkedToInvoice } from "@/actions/store/invoice/createInvoice";

interface AllPriceChangesTableProps {
  invoices: SerializedGlobalInvoiceWithChanges[];
}

const formatPrice = (cents?: number) => {
  if (cents === undefined || cents === null) return "N/A";
  return `$${(cents / 100).toFixed(2)}`;
};

export default function AllPriceChangesTable({
  invoices,
}: AllPriceChangesTableProps) {
  const router = useRouter();

  // Sheet Review State
  const [selectedInvoice, setSelectedInvoice] =
    useState<SerializedGlobalInvoiceWithChanges | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Delete Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] =
    useState<SerializedGlobalInvoiceWithChanges | null>(null);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");
  const [linkedProducts, setLinkedProducts] = useState<
    { productId: string; productName: string }[] | null
  >(null);
  const [isFetchingLinks, setIsFetchingLinks] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- REVIEW LOGIC ---
  const handleViewDetails = (invoice: SerializedGlobalInvoiceWithChanges) => {
    setSelectedInvoice(invoice);
    setIsSheetOpen(true);
  };

  const handleResolve = (
    invoiceId: string,
    logId: string,
    status: "APPROVED" | "REJECTED",
  ) => {
    startTransition(async () => {
      const result = await resolvePriceChange(invoiceId, logId, status);

      if (result.success) {
        toast.success(result.message);

        if (selectedInvoice) {
          const updatedProducts = selectedInvoice.products.map((p) =>
            p._id === logId ? { ...p, status } : p,
          );
          setSelectedInvoice({ ...selectedInvoice, products: updatedProducts });
        }
      } else {
        toast.error(result.message);
      }
    });
  };

  // --- DELETE LOGIC ---
  const handleDeleteClick = async (
    invoice: SerializedGlobalInvoiceWithChanges,
  ) => {
    setInvoiceToDelete(invoice);
    setDeleteConfirmationInput("");
    setIsDeleteDialogOpen(true);

    // Fetch linked products before showing the final confirmation
    setIsFetchingLinks(true);
    setLinkedProducts(null);
    try {
      const result = await getProductsLinkedToInvoice(invoice._id);
      if (result.success && result.data) {
        setLinkedProducts(result.data);
      }
    } catch (error) {
      toast.error("Failed to check for linked products.");
    } finally {
      setIsFetchingLinks(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!invoiceToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteInvoice(invoiceToDelete._id);
      if (result.success) {
        toast.success("Invoice deleted successfully");
        setIsDeleteDialogOpen(false);
        router.refresh(); // Refresh the page to remove the deleted invoice from the UI
      } else {
        toast.error(result.message || "Failed to delete invoice");
      }
    } catch (error) {
      toast.error("An error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
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
        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <Table className="min-w-43.75">
            <TableHeader>
              <TableRow>
                <TableHead>Date Added</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {invoices.map((invoice) => {
                const pendingCount = invoice.products.filter(
                  (p) => p.status === "PENDING",
                ).length;
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
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={() => handleViewDetails(invoice)}
                        >
                          <Eye className="w-4 h-4" />
                          Review
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="w-8 h-8"
                          onClick={() => handleDeleteClick(invoice)}
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
            const pendingCount = invoice.products.filter(
              (p) => p.status === "PENDING",
            ).length;
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
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={() => handleViewDetails(invoice)}
                  >
                    <Eye className="w-4 h-4" />
                    Review
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="px-3"
                    onClick={() => handleDeleteClick(invoice)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Confirm Invoice Deletion
            </DialogTitle>
            <DialogDescription className="pt-3">
              This action cannot be undone. This will permanently delete the
              invoice <strong>#{invoiceToDelete?.InvoiceNumber}</strong> and its
              associated document from ImageKit.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-slate-50 border rounded-md p-4 my-2 text-sm">
            <h4 className="font-semibold mb-2">Linked Products Check</h4>
            {isFetchingLinks ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Fetching linked
                products...
              </div>
            ) : linkedProducts && linkedProducts.length > 0 ? (
              <div className="text-amber-600 font-medium">
                Warning: This invoice is linked to {linkedProducts.length}{" "}
                product(s).
                <ul className="mt-2 list-disc list-inside px-4 text-xs text-slate-600 font-normal max-h-24 overflow-y-auto">
                  {linkedProducts.map((p) => (
                    <li key={p.productId}>{p.productName}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-green-600">
                No products are currently linked to this invoice.
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="confirm-delete" className="leading-relaxed">
              To verify, type the invoice number{" "}
              <strong className="select-all bg-slate-100 px-1 py-0.5 rounded">
                {invoiceToDelete?.InvoiceNumber}
              </strong>{" "}
              below:
            </Label>
            <Input
              id="confirm-delete"
              value={deleteConfirmationInput}
              onChange={(e) => setDeleteConfirmationInput(e.target.value)}
              placeholder={String(invoiceToDelete?.InvoiceNumber || "")}
              autoComplete="off"
            />
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={
                isDeleting ||
                deleteConfirmationInput !==
                  String(invoiceToDelete?.InvoiceNumber)
              }
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              {isDeleting ? "Deleting..." : "Permanently Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REVIEW SHEET ... (Remains exactly the same as your original code) ... */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        {/* ... Keep the exact same Sheet content from your original snippet ... */}
      </Sheet>
    </>
  );
}
