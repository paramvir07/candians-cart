"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, Copy, ExternalLink, Calendar, Building2, Tag, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation"; // 1. Import useRouter

export interface InvoiceProps {
  _id: string; 
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

interface InvoiceCardProps {
  invoice: InvoiceProps;
  onEdit?: (id: string) => void;
}

const InvoiceCard = ({ invoice, onEdit }: InvoiceCardProps) => {
  const router = useRouter(); // 2. Initialize router

  const handleCopyId = () => {
    navigator.clipboard.writeText(invoice._id);
    toast.success("Invoice ID copied!", {
      description: `ID: ${invoice._id}`,
    });
  };

  const handleViewDocument = () => {
    if (invoice.documentId?.url) {
      window.open(invoice.documentId.url, "_blank", "noopener,noreferrer");
    } else {
      toast.error("Document URL not found.");
    }
  };

  // 3. Create a handler that uses the prop IF provided, otherwise routes automatically
  const handleEdit = () => {
    if (onEdit) {
      onEdit(invoice._id);
    } else {
      router.push(`/store/invoice/${invoice._id}/edit`);
    }
  };

  const formattedDate = new Date(invoice.DateInvoiceCame).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 border-slate-200 bg-white group">
      <CardContent className="p-5 flex flex-col gap-4">
        {/* Header: Invoice Number & Actions */}
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
          
          {/* Action Buttons: Edit & Copy */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
              onClick={handleEdit} // 4. Attach the new handler here
              title="Edit Invoice"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit Invoice</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
              onClick={handleCopyId}
              title="Copy Invoice ID"
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy ID</span>
            </Button>
          </div>
        </div>

        {/* ... Rest of your component remains exactly the same ... */}
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

          {invoice.productNameInInvoice && (
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Tag className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="truncate">For: {invoice.productNameInInvoice}</span>
            </div>
          )}
        </div>

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