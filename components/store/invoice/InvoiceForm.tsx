"use client";

import { useState, useRef, useEffect } from "react";
import { Save, X, FileText, UploadCloud, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Your server actions
import { createInvoice, editInvoice, getInvoiceById } from "@/actions/store/invoice/createInvoice";

import { InvoiceFormSchema } from "@/zod/schemas/store/addProductsValidation";
import { zodErrorResponse } from "@/zod/validation/error";

interface InvoiceFormProps {
  storeId: string;
  invoiceId?: string; // Made optional to support both Create and Edit modes
}

const InvoiceForm = ({ storeId, invoiceId }: InvoiceFormProps) => {
  const router = useRouter();
  const isEditMode = !!invoiceId;

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEditMode);

  // Document Upload State
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [existingDocument, setExistingDocument] = useState<{ url: string; fileId: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    vendorName: "",
    InvoiceNumber: "",
    DateInvoiceCame: "", // (YYYY-MM-DD)
    productNameInInvoice: "",
    additionalNote: "",
  });

  // Fetch initial data if editing
  useEffect(() => {
    if (!invoiceId) return;

    const loadInvoiceData = async () => {
      try {
        const response = await getInvoiceById(invoiceId);
        if (response.success && response.data) {
          setFormData({
            vendorName: response.data.vendorName,
            InvoiceNumber: response.data.InvoiceNumber.toString(),
            DateInvoiceCame: response.data.DateInvoiceCame,
            productNameInInvoice: response.data.productNameInInvoice || "",
            additionalNote: response.data.additionalNote || "",
          });
          
          setExistingDocument(response.data.documentId);
          // Set preview to the existing remote URL initially
          setDocumentPreview(response.data.documentId.url); 
        } else {
          toast.error(response.message || "Failed to load invoice");
          router.push("/store/invoice");
        }
      } catch (error) {
        toast.error("An error occurred while loading the invoice.");
      } finally {
        setFetchingData(false);
      }
    };

    loadInvoiceData();
  }, [invoiceId, router]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setDocumentFile(file);

      if (file.type.startsWith("image/")) {
        setDocumentPreview(URL.createObjectURL(file));
      } else {
        setDocumentPreview("pdf-or-doc");
      }
    }
  };

  const handleRemoveDocument = () => {
    setDocumentFile(null);
    setDocumentPreview(null);
    setExistingDocument(null); // Clear remote document if user removes it
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    // Require document only if there is no existing document AND no new file
    if (!documentFile && !existingDocument) {
      toast.error("Please upload the invoice document.");
      return;
    }

    setLoading(true);

    try {
      let finalDocumentData = existingDocument;

      // 1. Upload NEW Document if one was selected
      if (documentFile) {
        const documentFormData = new FormData();
        documentFormData.append("file", documentFile);

        const uploadRes = await fetch("/imagekit", { // Check API path! Added /api/ prefix just in case
          method: "POST",
          body: documentFormData,
        });

        const uploadData = await uploadRes.json();

        if (!uploadData.success) {
          toast.error(uploadData.error || "Failed to upload document");
          setLoading(false);
          return;
        }

        finalDocumentData = {
          url: uploadData.url,
          fileId: uploadData.fileId,
        };
      }

      // 2. Prepare Payload
      const payload = {
        vendorName: formData.vendorName,
        invoiceNumber: Number(formData.InvoiceNumber),
        dateInvoiceCame: formData.DateInvoiceCame,
        productNameInInvoice: formData.productNameInInvoice || undefined,
        additionalNote: formData.additionalNote || undefined,
        document: finalDocumentData, // Uses new upload OR existing DB value
      };

      // 3. Client-Side Validation
      const validation = InvoiceFormSchema.safeParse(payload);
      if (!validation.success) {
        const errorMessage = zodErrorResponse(validation);
        toast.error(errorMessage || "Validation error");
        setLoading(false);
        return;
      }

      // 4. Branch Logic: Submit to Edit OR Create Server Action
      let result;
      if (isEditMode && invoiceId) {
        result = await editInvoice(invoiceId, validation.data);
      } else {
        result = await createInvoice(validation.data, storeId);
      }

      // 5. Handle Result
      if (result.success) {
        toast.success(`Invoice ${isEditMode ? "Updated" : "Uploaded"}`, {
          description: `Invoice #${formData.InvoiceNumber} has been saved successfully.`,
        });
        router.push("/store/invoice");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to save invoice.");
      }
    } catch (err) {
      toast.error("Something went wrong!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/store/invoice");
  };

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F9FAFB]">
        <div className="flex flex-col items-center text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin mb-4 text-indigo-600" />
          <p>Loading invoice details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 bg-[#F9FAFB] min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          {isEditMode ? "Edit Invoice" : "Add New Invoice"}
        </h1>
        <Button
          variant="outline"
          className="bg-white border-slate-200 shadow-sm px-6"
          onClick={handleCancel}
        >
          Cancel
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-slate-200">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-lg font-semibold">Invoice Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="vendorName">
                    Vendor Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="vendorName"
                    placeholder="e.g. Fresh Farms Wholesale"
                    value={formData.vendorName}
                    onChange={(e) => handleChange("vendorName", e.target.value)}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="InvoiceNumber">
                    Invoice Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="InvoiceNumber"
                    type="number"
                    placeholder="e.g. 10452"
                    value={formData.InvoiceNumber}
                    onChange={(e) => handleChange("InvoiceNumber", e.target.value)}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="DateInvoiceCame">
                    Date Received <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="DateInvoiceCame"
                    type="date"
                    value={formData.DateInvoiceCame}
                    onChange={(e) => handleChange("DateInvoiceCame", e.target.value)}
                    className="bg-white text-slate-700"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm ring-1 ring-slate-200">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-lg font-semibold">Additional Information</h2>

              <div className="space-y-2">
                <Label htmlFor="productNameInInvoice">
                  Product Name in Invoice{" "}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </Label>
                <Input
                  id="productNameInInvoice"
                  placeholder="e.g. Organic Whole Milk 2L"
                  value={formData.productNameInInvoice}
                  onChange={(e) => handleChange("productNameInInvoice", e.target.value)}
                  className="bg-white"
                />
                <p className="text-[10px] text-slate-500 leading-tight">
                  If this invoice is specifically for verifying a single product's pricing.
                </p>
              </div>

              <div className="space-y-2">
                <Label>
                  Additional Notes{" "}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </Label>
                <Textarea
                  placeholder="Any extra context for the admin reviewing this invoice..."
                  value={formData.additionalNote}
                  onChange={(e) => handleChange("additionalNote", e.target.value)}
                  className="min-h-32 bg-white"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Document Upload */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-slate-200">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">
                Invoice Document <span className="text-red-500">*</span>
              </h2>

              <input
                type="file"
                accept="image/png, image/jpeg, image/webp, application/pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleDocumentChange}
              />

              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-white min-h-60 relative overflow-hidden">
                {documentPreview ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center gap-2">
                    {documentPreview === "pdf-or-doc" ? (
                      <div className="flex flex-col items-center justify-center text-indigo-600 bg-indigo-50 p-6 rounded-lg w-full h-full">
                        <FileText className="w-12 h-12 mb-2 opacity-80" />
                        <span className="text-sm font-medium truncate max-w-50">
                          {documentFile?.name || "Existing Document"}
                        </span>
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={documentPreview}
                        alt="Document Preview"
                        className="max-h-50 w-auto object-contain rounded-md"
                      />
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-7 w-7 rounded-full shadow-md z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveDocument();
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="h-10 w-10 text-slate-300 mb-3" />
                    <p className="text-sm font-medium text-slate-700">
                      Upload Document
                    </p>
                    <p className="text-[12px] text-slate-400 mb-4 mt-1">
                      PDF, PNG, JPG up to 10MB
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose File
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 text-base font-semibold shadow-lg shadow-indigo-100 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {loading ? "Saving..." : isEditMode ? "Save Changes" : "Save Invoice"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;