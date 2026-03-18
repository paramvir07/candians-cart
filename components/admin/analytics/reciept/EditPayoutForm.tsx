"use client";

import { useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileDown,
  UploadCloud,
  Loader2,
  Save,
  ExternalLink,
  FileText,
} from "lucide-react";
import { updateStorePayoutAction } from "@/actions/admin/reciept/managePayout";
import { downloadSavedPayoutPdfAction } from "@/actions/admin/reciept/DownloadReciept";

type SerializedPayoutDetail = any;

const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export default function EditPayoutForm({
  initialData,
}: {
  initialData: SerializedPayoutDetail;
}) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"pending" | "paid">(initialData.status);
  const [note, setNote] = useState(initialData.additionalNote);

  // Existing uploaded receipt from the database
  const [receipt, setReceipt] = useState<{
    url: string;
    fileId: string;
  } | null>(initialData.paymentReciept);

  // New local file state (queued for upload)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setReceipt(null); // Clear existing DB receipt if the user selects a new file

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveDocument = () => {
    setReceipt(null);
    setSelectedFile(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    let finalReceiptUrl = receipt;

    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const res = await fetch("/imagekit", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (data.success) {
          finalReceiptUrl = { url: data.url, fileId: data.fileId };
        } else {
          toast.error(data.error || "Failed to upload document.");
          setIsSaving(false);
          return;
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("An unexpected error occurred during upload.");
        setIsSaving(false);
        return;
      }
    }

    startTransition(async () => {
      const result = await updateStorePayoutAction(initialData._id, {
        status,
        additionalNote: note,
        paymentReciept: finalReceiptUrl,
      });

      if (result.success) {
        toast.success(result.message);
        setReceipt(finalReceiptUrl);
        setSelectedFile(null);

        // Update local initialData references so the PDF has the newest save state
        initialData.status = status;
        initialData.additionalNote = note;
        initialData.paymentReciept = finalReceiptUrl;
      } else {
        toast.error(result.message);
      }
      setIsSaving(false);
    });
  };

  const handleDownloadSystemPDF = async () => {
    try {
      const toastId = toast.loading("Generating comprehensive PDF...");

      const base64Pdf = await downloadSavedPayoutPdfAction(initialData);

      const binaryString = window.atob(base64Pdf);
      const binaryLen = binaryString.length;
      const bytes = new Uint8Array(binaryLen);
      for (let i = 0; i < binaryLen; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Settlement_${initialData._id}.pdf`;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("PDF Downloaded successfully!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Payout Summary & PDF Download */}
      <Card className="lg:col-span-1 h-fit">
        <CardHeader>
          <CardTitle className="text-lg flex justify-between items-center">
            Summary
            <Badge
              variant={status === "paid" ? "default" : "secondary"}
              className={
                status === "paid" ? "bg-green-600 hover:bg-green-700" : ""
              }
            >
              {status.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timeline */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Period Start:</span>
            <span className="font-medium text-right">
              {format(new Date(initialData.startDate), "MMM dd, yyyy")}
            </span>
            <span className="text-muted-foreground">Period End:</span>
            <span className="font-medium text-right">
              {format(new Date(initialData.endDate), "MMM dd, yyyy")}
            </span>
          </div>

          {/* Order Breakdown */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Order Breakdown
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm bg-muted/30 p-3 rounded-lg border">
              <span className="text-muted-foreground">Customer Paid:</span>
              <span className="font-medium text-right">
                {formatCurrency(initialData.totalCustomerPaid)}
              </span>

              <span className="text-muted-foreground">Total GST:</span>
              <span className="font-medium text-right">
                {formatCurrency(initialData.totalGST)}
              </span>

              <span className="text-muted-foreground">Total PST:</span>
              <span className="font-medium text-right">
                {formatCurrency(initialData.totalPST)}
              </span>

              <span className="text-muted-foreground">Disposable Fees:</span>
              <span className="font-medium text-right">
                {formatCurrency(initialData.totalDisposableFee)}
              </span>

              {initialData.totalSubsidy > 0 && (
                <>
                  <span className="text-muted-foreground">
                    Subsidies Applied:
                  </span>
                  <span className="font-medium text-right text-red-500">
                    -{formatCurrency(initialData.totalSubsidy)}
                  </span>
                </>
              )}

              <div className="col-span-2 border-t my-1" />

              <span className="font-medium">Store Fixed Value (Cost):</span>
              <span className="font-bold text-right">
                {formatCurrency(initialData.storeFixedValue)}
              </span>
            </div>
          </div>

          {/* Margins & Adjustments */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Margins & Adjustments
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm bg-muted/30 p-3 rounded-lg border">
              <span className="text-muted-foreground">Store Profit (30%):</span>
              <span className="font-medium text-right">
                {formatCurrency(initialData.storeProfit)}
              </span>


              <span className="text-muted-foreground">Total Cash Collected (From Orders):</span>
              <span className="font-medium text-right text-red-500">
                -{formatCurrency(initialData.totalOrderCashCollected || 0)}
              </span>
                            <span className="text-muted-foreground">Total Cash Collected (From Wallet Topups):</span>
              <span className="font-medium text-right text-red-500">
                -{formatCurrency(initialData.totalWalletTopUpCashCollected || 0)}
              </span>

              <span className="text-muted-foreground">Cash Collected:</span>
              <span className="font-medium text-right text-red-500">
                -{formatCurrency(initialData.totalCashCollected || 0)}
              </span>

              <span className="text-muted-foreground">Platform Comm.:</span>
              <span className="font-medium text-right">
                {formatCurrency(initialData.platformCommision)}
              </span>
            </div>
          </div>

          {/* Final Totals */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Final Totals
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm bg-green-50/50 p-3 rounded-lg border border-green-100">
              <span className="font-medium text-green-900">Store Payout:</span>
              <span className="font-bold text-right text-green-700 text-base">
                {formatCurrency(initialData.storePayout)}
              </span>

              <span className="font-medium text-green-900">
                Platform Profit:
              </span>
              <span className="font-bold text-right text-green-700">
                {formatCurrency(initialData.platformProfit)}
              </span>
            </div>
          </div>

          <Button
            onClick={handleDownloadSystemPDF}
            className="w-full mt-4"
            variant="outline"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Download Generated PDF
          </Button>
        </CardContent>
      </Card>

      {/* Right Column: Editable Form (Status, Notes, Document) */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Update Payment Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Toggle */}
          <div className="flex items-center gap-3 bg-muted/50 p-4 rounded-lg">
            <span className="font-medium">Mark as Paid?</span>
            <Button
              variant={status === "paid" ? "default" : "outline"}
              className={
                status === "paid"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : ""
              }
              onClick={() =>
                setStatus(status === "pending" ? "paid" : "pending")
              }
              disabled={isSaving}
            >
              {status === "paid" ? "Yes, Paid" : "No, Pending"}
            </Button>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Additional Notes (Optional)
            </label>
            <Textarea
              placeholder="E-Transfer reference number, bank notes, etc."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              disabled={isSaving}
            />
          </div>

          {/* Payment Receipt Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Proof of Payment Document (Optional)
            </label>

            {receipt ? (
              <div className="relative border rounded-lg p-4 bg-muted/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 relative rounded overflow-hidden border shrink-0 bg-white flex items-center justify-center">
                    {receipt.url.endsWith(".pdf") ? (
                      <span className="text-xs font-semibold text-muted-foreground">
                        PDF
                      </span>
                    ) : (
                      <Image
                        src={receipt.url}
                        alt="Receipt"
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Document Saved</p>
                    <Link
                      href={receipt.url}
                      target="_blank"
                      className="text-xs text-blue-600 flex items-center gap-1 mt-1 hover:underline"
                    >
                      Open Document <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveDocument}
                  className="text-red-500 hover:text-red-600 w-full sm:w-auto"
                  disabled={isSaving}
                >
                  Remove
                </Button>
              </div>
            ) : selectedFile ? (
              <div className="relative border rounded-lg p-4 bg-yellow-50/50 border-yellow-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded border bg-white flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate max-w-50 sm:max-w-75">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-yellow-700 mt-1 font-medium">
                      Ready to upload on save
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveDocument}
                  className="text-red-500 hover:text-red-600 w-full sm:w-auto"
                  disabled={isSaving}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors ${isSaving ? "bg-muted/10 cursor-not-allowed opacity-50" : "bg-muted/20 hover:bg-muted/40 cursor-pointer"}`}
                onClick={() => !isSaving && fileInputRef.current?.click()}
              >
                <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-slate-700">
                  Click to Select Receipt
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, WEBP, or PDF
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg, image/png, image/webp, application/pdf"
                  onChange={handleFileChange}
                />
              </div>
            )}
          </div>

          <div className="pt-4 border-t flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving || isPending}
              className="w-full sm:w-auto"
            >
              {isSaving || isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {selectedFile ? "Uploading & Saving..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
