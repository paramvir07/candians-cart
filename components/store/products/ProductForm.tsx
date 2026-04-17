"use client";

import { useState, useRef } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

// Server actions
import { createProduct } from "@/actions/store/products/addProducts";
import { updateProduct } from "@/actions/store/products/editProduct";
import { searchProducts } from "@/actions/common/searchProducts.action";
import {
  createProductFormSchema,
  ProductFormValues,
} from "@/zod/schemas/store/addProductsValidation";
import { zodErrorResponse } from "@/zod/validation/error";

// Types
import { IProduct } from "@/types/store/products.types";

// Child components — pure UI, no logic
import { FormTopBar } from "./Formtopbar";
import { BasicInfoSection } from "./Basicinfosection";
import { FinancialsSection } from "./Financialssection";
import { RightSidebar } from "./Rightsidebar";

interface ProductFormProps {
  initialData?: IProduct | null;
  storeId?: string;
  role: "admin" | "store";
}

const ProductForm = ({ initialData, storeId, role }: ProductFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Duplicate Check State
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [potentialDuplicates, setPotentialDuplicates] = useState<IProduct[]>(
    [],
  );

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.images?.[0]?.url || null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state — single source of truth
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    markup: initialData?.markup?.toString() || "",
    tax: initialData ? Math.round(initialData.tax * 100).toString() : "",
    price: initialData ? (initialData.price / 100).toFixed(2) : "",
    disposableFee: initialData?.disposableFee
      ? (initialData.disposableFee / 100).toFixed(2)
      : "",
    stock: initialData ? String(initialData.stock) : "true",
    isFeatured: initialData ? String(initialData.isFeatured) : "false",
    InvoiceId: initialData?.InvoiceId || "",
    isMeasuredInWeight: initialData?.isMeasuredInWeight ? "true" : "false",
    UOM: initialData?.UOM || "",
    primaryUPC: initialData?.primaryUPC?.toString() || "",
  });

  const handleChange = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast.error("File size must be less than 4MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Step 1: Pre-Submit Validation and Duplicate Check
  const handlePreSubmitValidation = async () => {
    // Basic validation check before hitting the DB for duplicates
    const rawpayload: ProductFormValues = {
      name: formData.name,
      description: formData.description,
      category: formData.category as ProductFormValues["category"],
      markup: parseFloat(formData.markup) || 0,
      tax: parseFloat(formData.tax) || 0,
      disposableFee: parseFloat(formData.disposableFee) || 0,
      price: parseFloat(formData.price) || 0,
      stock: formData.stock === "true",
      images: initialData?.images || [], // Uses existing images temporarily for validation
      isFeatured: formData.isFeatured === "true",
      InvoiceId: formData.InvoiceId,
      isMeasuredInWeight: formData.isMeasuredInWeight === "true",
      UOM: formData.UOM || undefined,
      primaryUPC: parseInt(formData.primaryUPC, 10)
    };

    const schema = createProductFormSchema(role);
    const validationResult = schema.safeParse(rawpayload);

    if (!validationResult.success) {
      toast.error(`Validation Error: ${zodErrorResponse(validationResult)}`);
      return;
    }

    setLoading(true);

    try {
      // Execute Fuzzy Search
      const searchRes = await searchProducts(formData.name, storeId);

      if (searchRes.success && searchRes.data && searchRes.data.length > 0) {
        // Filter out the current product if we are in Edit Mode
        const duplicates = searchRes.data.filter(
          (p) => p._id.toString() !== initialData?._id?.toString(),
        );

        if (duplicates.length > 0) {
          setPotentialDuplicates(duplicates);
          setIsDuplicateModalOpen(true);
          setLoading(false);
          return; // Pause submission, wait for user confirmation
        }
      }
    } catch (err) {
      console.error("Duplicate check failed, proceeding with save", err);
      // If the search fails, we fail open and allow them to save anyway
    }

    // If no duplicates are found, proceed straight to execution
    await executeSubmit(validationResult.data);
  };

  // Step 2: Final Execution (Image upload + Save)
  const executeSubmit = async (preValidatedPayload?: ProductFormValues) => {
    setLoading(true);
    setIsDuplicateModalOpen(false);

    try {
      let finalImages = initialData?.images || [];
      if (!imagePreview && !imageFile) finalImages = [];

      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);
        const uploadRes = await fetch("/imagekit", {
          method: "POST",
          body: fd,
        });
        const uploadData = await uploadRes.json();
        if (!uploadData.success) {
          toast.error(uploadData.error || "Failed to upload image");
          setLoading(false);
          return;
        }
        finalImages = uploadData.images;
      }

      // Reconstruct payload with final images
      const rawpayload: ProductFormValues = {
        name: formData.name,
        description: formData.description,
        category: formData.category as ProductFormValues["category"],
        markup: parseFloat(formData.markup) || 0,
        tax: parseFloat(formData.tax) || 0,
        disposableFee: parseFloat(formData.disposableFee) || 0,
        price: parseFloat(formData.price) || 0,
        stock: formData.stock === "true",
        images: finalImages,
        isFeatured: formData.isFeatured === "true",
        InvoiceId: formData.InvoiceId,
        isMeasuredInWeight: formData.isMeasuredInWeight === "true",
        UOM: formData.UOM || undefined,
        primaryUPC: parseInt(formData.primaryUPC, 10)
      };

      // Final validation pass
      const schema = createProductFormSchema(role);
      const validationResult = schema.safeParse(rawpayload);

      if (!validationResult.success) {
        toast.error(`Validation Error: ${zodErrorResponse(validationResult)}`);
        setLoading(false);
        return;
      }

      const payload = validationResult.data;
      let result;

      if (initialData) {
        result = await updateProduct(initialData._id, payload);
      } else {
        result = storeId
          ? await createProduct(payload, storeId)
          : await createProduct(payload);
      }

      if (result.success) {
        toast.success(initialData ? "Product Updated" : "Product Created", {
          description: `${formData.name} has been saved successfully.`,
        });
        router.push(
          storeId ? `/admin/store/${storeId}/products` : "/store/products",
        );
        router.refresh();
      } else {
        toast.error(result.message || "An error occurred.");
      }
    } catch {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const navigateBack = () =>
    router.push(
      storeId ? `/admin/store/${storeId}/products` : "/store/products",
    );

  const isEditMode = !!initialData;
  const buttonText = loading
    ? "Saving…"
    : isEditMode
      ? "Update Product"
      : "Create Product";

  return (
    <div className="min-h-screen bg-muted/30">
      <FormTopBar
        isEditMode={isEditMode}
        loading={loading}
        buttonText={buttonText}
        onBack={navigateBack}
        onSubmit={handlePreSubmitValidation}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* LEFT */}
          <div className="space-y-6">
            <BasicInfoSection
              name={formData.name}
              description={formData.description}
              primaryUPC={formData.primaryUPC}
              isMeasuredInWeight={formData.isMeasuredInWeight}
              UOM={formData.UOM}
              stock={formData.stock}
              isFeatured={formData.isFeatured}
              price={formData.price}
              onChange={handleChange}
            />
            <FinancialsSection
              markup={formData.markup}
              tax={formData.tax}
              disposableFee={formData.disposableFee}
              price={formData.price}
              onChange={handleChange}
            />
          </div>

          {/* RIGHT */}
          <RightSidebar
            imagePreview={imagePreview}
            fileInputRef={fileInputRef}
            onImageChange={handleImageChange}
            onRemoveImage={handleRemoveImage}
            category={formData.category}
            onCategoryChange={(v) => handleChange("category", v)}
            InvoiceId={formData.InvoiceId}
            onInvoiceChange={(v) => handleChange("InvoiceId", v)}
            loading={loading}
            buttonText={buttonText}
            onSubmit={handlePreSubmitValidation}
          />
        </div>
      </div>

      {/* Mobile sticky save bar */}
      <div className="lg:hidden sticky bottom-0 z-20 bg-background/90 backdrop-blur-md border-t border-border/60 px-4 py-3">
        <Button
          onClick={handlePreSubmitValidation}
          disabled={loading}
          className="w-full gap-2 py-5 text-sm font-semibold"
        >
          <Save className="w-4 h-4" />
          {buttonText}
        </Button>
      </div>

      {/* Duplicate Check Dialog */}
      <Dialog
        open={isDuplicateModalOpen}
        onOpenChange={setIsDuplicateModalOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Potential Duplicates Found</DialogTitle>
            <DialogDescription>
              We found similar products already in the store. Please review them
              below to avoid creating duplicates.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-75 w-full rounded-md border p-4">
            <div className="space-y-4">
              {potentialDuplicates.map((dup) => (
                <div
                  key={dup._id}
                  className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {dup.name}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {dup.category}{" "}
                      {dup.primaryUPC ? `| UPC: ${dup.primaryUPC}` : ""}
                    </p>
                  </div>
                  <div className="text-sm font-medium">
                    ${(dup.price / 100).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <DialogFooter className="sm:justify-end gap-2 sm:gap-0 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDuplicateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={() => executeSubmit()}>
              Proceed Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductForm;
