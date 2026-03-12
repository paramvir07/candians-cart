"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, Copy, ExternalLink, Calendar, Building2, Tag } from "lucide-react";
import { toast } from "sonner";

// Type definition based on your Mongoose Model
export interface InvoiceProps {
  _id: string; // The MongoDB generated ID used for copying
  vendorName: string;
  DateInvoiceCame: string | Date;
  InvoiceNumber: number;
  documentId: {
    url: string;
    fileId: string;
  };
  productNameInInvoice?: string;
  additionalNote?: string;
}

const InvoiceCard = ({ invoice }: { invoice: InvoiceProps }) => {
  // 1. Copy Invoice ID to Clipboard
  const handleCopyId = () => {
    navigator.clipboard.writeText(invoice._id);
    toast.success("Invoice ID copied!", {
      description: `ID: ${invoice._id}`,
    });
  };

  // 2. Open Document in New Tab
  const handleViewDocument = () => {
    if (invoice.documentId?.url) {
      window.open(invoice.documentId.url, "_blank", "noopener,noreferrer");
    } else {
      toast.error("Document URL not found.");
    }
  };

  // 3. Format Date safely
  const formattedDate = new Date(invoice.DateInvoiceCame).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 border-slate-200 bg-white group">
      <CardContent className="p-5 flex flex-col gap-4">
        {/* Header: Invoice Number & Copy Button */}
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Invoice No.
              </p>
              <h3 className="font-semibold text-slate-900 leading-none mt-1">
                {invoice.InvoiceNumber}
              </h3>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
            onClick={handleCopyId}
            title="Copy Invoice id"
          >
            <Copy className="h-4 w-4" />
            <span className="sr-only">Copy ID</span>
          </Button>
        </div>

        {/* Middle Details: Vendor & Date */}
        <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="font-medium truncate" title={invoice.vendorName}>
              {invoice.vendorName}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
            <span>{formattedDate}</span>
          </div>

          {/* Optional: Show product name if it was explicitly mapped on the invoice */}
          {invoice.productNameInInvoice && (
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Tag className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="truncate">For: {invoice.productNameInInvoice}</span>
            </div>
          )}
        </div>

        {/* Bottom Actions: View Document */}
        <div className="pt-1 mt-auto">
          <Button
            variant="outline"
            className="w-full bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm"
            onClick={handleViewDocument}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Document
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceCard;