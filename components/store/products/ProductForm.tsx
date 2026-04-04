"use client";

import { useState, useRef } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

// Server actions
import { createProduct } from "@/actions/store/products/addProducts";
import { updateProduct } from "@/actions/store/products/editProduct";
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

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let finalImages = initialData?.images || [];
      if (!imagePreview && !imageFile) finalImages = [];

      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);
        const uploadRes = await fetch("/imagekit", { method: "POST", body: fd });
        const uploadData = await uploadRes.json();
        if (!uploadData.success) {
          toast.error(uploadData.error || "Failed to upload image");
          return;
        }
        finalImages = uploadData.images;
      }

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
        primaryUPC: formData.primaryUPC
          ? parseInt(formData.primaryUPC, 10)
          : undefined,
      };

      const schema = createProductFormSchema(role);
      const validationResult = schema.safeParse(rawpayload);
      if (!validationResult.success) {
        toast.error(`Validation Error: ${zodErrorResponse(validationResult)}`);
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
        onSubmit={handleSubmit}
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
            onSubmit={handleSubmit}
          />
        </div>
      </div>

      {/* Mobile sticky save bar */}
      <div className="lg:hidden sticky bottom-0 z-20 bg-background/90 backdrop-blur-md border-t border-border/60 px-4 py-3">
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full gap-2 py-5 text-sm font-semibold"
        >
          <Save className="w-4 h-4" />
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

export default ProductForm;