"use client";

import { useState, useRef } from "react";
import {
  Image as ImageIcon,
  Save,
  X,
  Package,
  DollarSign,
  Tag,
  FileText,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Actions
import { createProduct } from "@/actions/store/products/addProducts";
import { updateProduct } from "@/actions/store/products/editProduct";
import {
  createProductFormSchema,
  ProductFormValues,
} from "@/zod/schemas/store/addProductsValidation";
import { zodErrorResponse } from "@/zod/validation/error";

// Types
import { IProduct } from "@/types/store/products.types";

interface ProductFormProps {
  initialData?: IProduct | null;
  storeId?: string;
  role: "admin" | "store";
}

/* ─── tiny helper ─────────────────────────────────── */
function SectionCard({
  icon: Icon,
  title,
  children,
  accent,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <Card className="border border-border/60 shadow-sm bg-card overflow-hidden">
      <CardHeader className="pb-4 pt-5 px-6">
        <CardTitle className="flex items-center gap-2.5 text-base font-semibold text-foreground">
          <span
            className={`flex items-center justify-center w-7 h-7 rounded-lg ${accent ?? "bg-primary/10 text-primary"}`}
          >
            <Icon className="w-3.5 h-3.5" />
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <Separator className="mb-0" />
      <CardContent className="p-6 space-y-5">{children}</CardContent>
    </Card>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground/80">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/* ─── main component ──────────────────────────────── */
const ProductForm = ({ initialData, storeId, role }: ProductFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.images?.[0]?.url || null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        const uploadRes = await fetch("/imagekit", {
          method: "POST",
          body: fd,
        });
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
    } catch (err) {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const isEditMode = !!initialData;
  const buttonText = loading
    ? "Saving…"
    : isEditMode
      ? "Update Product"
      : "Create Product";

  return (
    <div className="min-h-screen bg-muted/30">
      {/* ── Top bar ─────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() =>
                router.push(
                  storeId
                    ? `/admin/store/${storeId}/products`
                    : "/store/products",
                )
              }
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-base font-semibold text-foreground truncate">
                {isEditMode ? "Edit Product" : "New Product"}
              </h1>
              {isEditMode && (
                <Badge variant="secondary" className="text-[10px] shrink-0">
                  Editing
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="text-sm hidden sm:flex"
              onClick={() =>
                router.push(
                  storeId
                    ? `/admin/store/${storeId}/products`
                    : "/store/products",
                )
              }
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={loading}
              onClick={handleSubmit}
              className="text-sm bg-primary hover:bg-primary/90 gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{buttonText}</span>
              <span className="sm:hidden">{loading ? "…" : "Save"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* ── LEFT ──────────────────────────────────── */}
          <div className="space-y-6">
            {/* Basic Info */}
            <SectionCard
              icon={Package}
              title="Basic Information"
              accent="bg-blue-500/10 text-blue-600"
            >
              <Field label="Product Name" required>
                <Input
                  placeholder="e.g. Organic Whole Milk"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </Field>

              <Field label="Description" required>
                <Textarea
                  placeholder="Describe the product — ingredients, weight, key features…"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="min-h-32 resize-none"
                />
              </Field>

              <FieldRow>
                <Field
                  label="Primary UPC Barcode"
                  hint="10-12 digit barcode number"
                >
                  <Input
                    type="number"
                    placeholder="e.g. 123456789012"
                    value={formData.primaryUPC}
                    onChange={(e) => handleChange("primaryUPC", e.target.value)}
                  />
                </Field>

                <Field label="Measurement Type">
                  <Select
                    value={formData.isMeasuredInWeight}
                    onValueChange={(v) => handleChange("isMeasuredInWeight", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Sold by Unit/Item</SelectItem>
                      <SelectItem value="true">Sold by Weight</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldRow>

              {/* 🆕 Conditional Unit of Measurement */}
              {formData.isMeasuredInWeight === "true" && (
                <div className="pt-2 animate-fade-in-up">
                  <Field
                    label="Unit of Measurement (UOM)"
                    hint="e.g. kg, lbs, grams, liters"
                  >
                    <Input
                      placeholder="e.g. kg"
                      value={formData.UOM}
                      onChange={(e) => handleChange("UOM", e.target.value)}
                    />
                  </Field>
                </div>
              )}

              <FieldRow>
                <Field label="Stock Status" required>
                  <Select
                    value={formData.stock}
                    onValueChange={(v) => handleChange("stock", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                          In Stock
                        </span>
                      </SelectItem>
                      <SelectItem value="false">
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-destructive inline-block" />
                          Out of Stock
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Featured Status" required>
                  <Select
                    value={formData.isFeatured}
                    onValueChange={(v) => handleChange("isFeatured", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          Featured
                        </span>
                      </SelectItem>
                      <SelectItem value="false">Not Featured</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldRow>

              <Field
                label="Base Price (CAD)"
                required
                hint={`Stored as: ${Math.round((parseFloat(formData.price) || 0) * 100)} cents`}
              >
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    className="pl-7"
                  />
                </div>
              </Field>
            </SectionCard>

            {/* Financials */}
            <SectionCard
              icon={DollarSign}
              title="Financials & Fees"
              accent="bg-emerald-500/10 text-emerald-600"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Markup (%)" required hint="Range: 30 – 35%">
                  <Input
                    type="number"
                    placeholder="30"
                    min={30}
                    max={35}
                    value={formData.markup}
                    onChange={(e) => handleChange("markup", e.target.value)}
                  />
                </Field>

                <Field label="Tax Rate" required>
                  <Select
                    value={formData.tax}
                    onValueChange={(v) => handleChange("tax", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No Tax (0%)</SelectItem>
                      <SelectItem value="5">GST (5%)</SelectItem>
                      <SelectItem value="7">PST (7%)</SelectItem>
                      <SelectItem value="12">GST + PST (12%)</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Disposable Fee (CAD)">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">
                      $
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.10"
                      value={formData.disposableFee}
                      onChange={(e) =>
                        handleChange("disposableFee", e.target.value)
                      }
                      className="pl-7"
                    />
                  </div>
                </Field>
              </div>

              {/* Live price preview */}
              {formData.price && formData.markup && (
                <div className="rounded-lg bg-muted/50 border border-border/50 px-4 py-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  {(() => {
                    const base = parseFloat(formData.price) || 0;
                    const markup = parseFloat(formData.markup) || 0;
                    const tax = parseFloat(formData.tax) || 0;
                    const fee = parseFloat(formData.disposableFee) || 0;
                    const withMarkup = base * (1 + markup / 100);
                    const withTax = withMarkup * (1 + tax / 100);
                    const total = withTax + fee;
                    return (
                      <>
                        <span className="text-muted-foreground">
                          After markup:{" "}
                          <span className="font-semibold text-foreground">
                            ${withMarkup.toFixed(2)}
                          </span>
                        </span>
                        <span className="text-muted-foreground">
                          With tax + fee:{" "}
                          <span className="font-semibold text-foreground">
                            ${total.toFixed(2)}
                          </span>
                        </span>
                      </>
                    );
                  })()}
                </div>
              )}
            </SectionCard>
          </div>

          {/* ── RIGHT ─────────────────────────────────── */}
          <div className="space-y-6">
            {/* Image Upload */}
            <SectionCard
              icon={ImageIcon}
              title="Product Image"
              accent="bg-violet-500/10 text-violet-600"
            >
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageChange}
              />

              {imagePreview ? (
                <div className="relative group rounded-xl overflow-hidden border border-border/60 bg-muted/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-52 object-contain p-3"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Replace
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleRemoveImage}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-border hover:border-primary/50 rounded-xl transition-colors bg-muted/20 hover:bg-primary/5 flex flex-col items-center justify-center gap-2 py-10 group"
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <ImageIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground/70 group-hover:text-primary transition-colors">
                      Click to upload
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      PNG, JPG, WebP · max 4 MB
                    </p>
                  </div>
                </button>
              )}
            </SectionCard>

            {/* Category */}
            <SectionCard
              icon={Tag}
              title="Classification"
              accent="bg-orange-500/10 text-orange-600"
            >
              <Field label="Category" required>
                <Select
                  value={formData.category}
                  onValueChange={(v) => handleChange("category", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {[
                      "Fruits",
                      "Vegetables",
                      "Dairy",
                      "Meat",
                      "Bakery",
                      "Beverages",
                      "Snacks",
                      "Household",
                      "Oil & Ghee",
                      "Pulses & Lentils",
                      "Flour & Atta",
                      "Rice",
                      "Spices",
                      "Pickles & Chutneys",
                      "Instant Foods",
                      "Frozen Foods",
                      "Sweets & Mithai",
                      "Dry Fruits & Nuts",
                      "Tea & Coffee",
                      "Sauces & Condiments",
                      "Papad & Fryums",
                      "Pooja / Religious Items",
                      "Utensils",
                      "Disposables",
                      "Personal Care",
                      "Other",
                    ].map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </SectionCard>

            {/* Invoice */}
            <SectionCard
              icon={FileText}
              title="Invoice Details"
              accent="bg-sky-500/10 text-sky-600"
            >
              <Field
                label="Invoice ID"
                required
                hint="Required when creating a product or changing its price."
              >
                <Input
                  placeholder="Paste verified Invoice ID…"
                  value={formData.InvoiceId}
                  onChange={(e) => handleChange("InvoiceId", e.target.value)}
                  className="font-mono text-sm"
                />
              </Field>
              <Link
                href="/store/invoice/add/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline underline-offset-2 transition-colors"
              >
                <FileText className="w-3 h-3" />
                Add a new Invoice
              </Link>
            </SectionCard>

            {/* Save — mobile sticky at bottom, desktop inline */}
            <div className="hidden lg:block">
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
        </div>
      </div>

      {/* ── Mobile sticky save bar ─────────────────── */}
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
