"use client";

import { useState, useRef } from "react";
import { Image as ImageIcon, Save, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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

// Actions
import { createProduct } from "@/actions/store/products/addProducts";
import { updateProduct } from "@/actions/store/products/editProduct";
import { ProductFormValues } from "@/zod/schemas/store/addProductsValidation";

// Types
import { IProduct } from "@/types/store/products.types";

interface ProductFormProps {
  initialData?: IProduct | null; // If null, we are in "Add Mode"
  storeId?: string;
}

const ProductForm = ({ initialData, storeId }: ProductFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | string[]>([]);

  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.images?.[0]?.url || null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. DYNAMIC INITIALIZATION
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
    isFeatured: initialData ? String(initialData.stock) : "false",
    InvoiceId: initialData?.InvoiceId || "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Client-side validation: Max 4MB
      if (file.size > 4 * 1024 * 1024) {
        toast.error("File size must be less than 4MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError([]);

    try {
      // 1. Determine final images array
      let finalImages = initialData?.images || [];

      // If user cleared the preview and didn't upload a new file, it means they deleted the image
      if (!imagePreview && !imageFile) {
        finalImages = [];
      }

      // If there's a new image selected, upload it to ImageKit
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append("file", imageFile);

        const uploadRes = await fetch("/imagekit", {
          method: "POST",
          body: imageFormData,
        });

        const uploadData = await uploadRes.json();

        if (!uploadData.success) {
          toast.error(uploadData.error || "Failed to upload image");
          setLoading(false);
          return; // Stop form submission if image upload fails
        }

        // Replace the images array with the newly uploaded image
        finalImages = uploadData.images;
      }

      // 2. Prepare JSON payload matching ProductFormValues Zod schema
      const payload: ProductFormValues = {
        name: formData.name,
        description: formData.description,
        category: formData.category as ProductFormValues["category"],
        markup: parseFloat(formData.markup) || 0,
        tax: parseFloat(formData.tax) || 0,
        disposableFee: parseFloat(formData.disposableFee) || 0,
        price: parseFloat(formData.price) || 0,
        stock: formData.stock === "true",
        images: finalImages,
        isFeatured: formData.isFeatured === "false",
        InvoiceId: formData.InvoiceId,
      };

      // 3. Conditional Submission (Create vs Update)
      let result;
      if (initialData) {
        result = await updateProduct(initialData._id, payload);
      } else {
        if (storeId) {
          result = await createProduct(payload, storeId);
        } else {
          result = await createProduct(payload);
        }
      }

      // 4. Handle Result
      if (result.success) {
        toast.success(initialData ? "Product Updated" : "Product Created", {
          description: `${formData.name} has been saved successfully.`,
        });
        if (storeId) {
          router.push(`/admin/store/${storeId}/products`);
        } else {
          router.push("/store/products");
        }

        router.refresh();
      } else {
        if (result.errors) {
          toast.error("Validation Failed");
          console.log(result.errors);
        } else {
          toast.error(result.message || "An error occurred.");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred." + err);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/store/products");
  };

  const title = initialData ? "Edit Product" : "Add Product";
  const buttonText = loading
    ? "Saving..."
    : initialData
      ? "Update Product"
      : "Create Product";

  return (
    <div className="max-w-6xl mx-auto p-8 bg-[#F9FAFB] min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
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
              <h2 className="text-lg font-semibold">Basic Information</h2>

              <div className="space-y-2">
                <Label htmlFor="name">
                  Product Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Organic Whole Milk"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  placeholder="Describe the product features..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="min-h-40 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>
                    Stock Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.stock}
                    onValueChange={(val) => handleChange("stock", val)}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">In Stock</SelectItem>
                      <SelectItem value="false">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>
                    Featured Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.isFeatured}
                    onValueChange={(val) => handleChange("isFeatured", val)}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Featured</SelectItem>
                      <SelectItem value="false">Not Featured</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>
                    Base Price (CAD) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    className="bg-white"
                  />
                  <p className="text-[10px] text-slate-500">
                    Will be stored as:{" "}
                    {Math.round((parseFloat(formData.price) || 0) * 100)} cents
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm ring-1 ring-slate-200">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-lg font-semibold">Financials & Fees</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>
                    Markup (%) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    placeholder="30"
                    value={formData.markup}
                    onChange={(e) => handleChange("markup", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Tax Rate <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.tax}
                    onValueChange={(val) => handleChange("tax", val)}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select Tax Rate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No Tax (0%)</SelectItem>
                      <SelectItem value="5">GST (5%)</SelectItem>
                      <SelectItem value="7">PST (7%)</SelectItem>
                      <SelectItem value="12">GST+PST (12%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Disposable Fee (CAD)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.10"
                    value={formData.disposableFee}
                    onChange={(e) =>
                      handleChange("disposableFee", e.target.value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Media & Category */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-slate-200">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Product Image</h2>

              {/* Hidden File Input */}
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageChange}
              />

              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-white min-h-50 relative">
                {imagePreview ? (
                  <div className="relative w-full flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-50 w-auto object-contain rounded-md"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage();
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-[12px] text-slate-400 mb-4">
                      PNG, JPG up to 4MB
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Upload Image
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm ring-1 ring-slate-200">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Classification</h2>
              <div className="space-y-2">
                <Label className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) => handleChange("category", val)}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
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
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm ring-1 ring-slate-200">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Invoice Details</h2>
              <div className="space-y-2">
                <Label htmlFor="InvoiceId">
                  Invoice ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="InvoiceId"
                  placeholder="Paste verified Invoice ID here..."
                  value={formData.InvoiceId}
                  onChange={(e) => handleChange("InvoiceId", e.target.value)}
                  className="bg-white"
                />
                <p className="text-[10px] text-slate-500 leading-tight">
                  You must attach an Invoice ID for creating a new product or
                  changing prices.
                </p>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 text-base font-semibold shadow-lg shadow-indigo-100 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
