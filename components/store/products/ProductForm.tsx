"use client";

import { useState } from "react";
import { Plus, Image as ImageIcon, Save } from "lucide-react";
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
}

const ProductForm = ({ initialData }: ProductFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | string[]>([]);

  // 1. DYNAMIC INITIALIZATION
  // If initialData exists, we convert DB format (cents/decimals) -> Form format (strings)
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    markup: initialData?.markup?.toString() || "",

    // DB stores 0.05, Form expects "5"
    tax: initialData ? Math.round(initialData.tax * 100).toString() : "",

    // DB stores 1000 (cents), Form expects "10.00"
    price: initialData ? (initialData.price / 100).toFixed(2) : "",

    // DB stores 10 (cents), Form expects "0.10"
    disposableFee: initialData?.disposableFee
      ? (initialData.disposableFee / 100).toFixed(2)
      : "",

    // DB stores boolean, Form Select expects "true"/"false" string
    stock: initialData ? String(initialData.stock) : "true",

    images: initialData?.images || [],
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError([]);

    try {
      // Prepare Payload (Matches Zod Schema)
      const payload = {
        name: formData.name,
        description: formData.description,
        category: formData.category as ProductFormValues["category"],
        markup: parseFloat(formData.markup) || 0,
        tax: parseFloat(formData.tax) || 0,
        disposableFee: parseFloat(formData.disposableFee) || 0,
        price: parseFloat(formData.price) || 0,
        stock: formData.stock === "true", // Convert string back to boolean
        images: formData.images,
      };

      let result;

      // 2. CONDITIONAL SUBMISSION
      if (initialData) {
        // --- EDIT MODE ---
        result = await updateProduct(initialData._id, payload);
      } else {
        // --- CREATE MODE ---
        result = await createProduct(payload);
      }

      if (result.success) {
        toast.success(initialData ? "Product Updated" : "Product Created", {
          description: `${formData.name} has been saved successfully.`,
        });
        router.push("/store/products");
        router.refresh(); // Ensure the list page shows new data
      } else {
        if (result.errors) {
          toast.error("Validation Failed");
          console.log(result.errors);
        } else {
          toast.error(result.message || "An error occurred.");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/store/products");
  };

  // 3. UI TEXT CHANGES based on mode
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
              <h2 className="text-lg font-semibold">Images</h2>
              <div className="border-2 border-dashed border-slate-100 rounded-xl p-6 flex flex-col items-center text-center bg-white">
                <ImageIcon className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-[10px] text-slate-400 mb-4">
                  PNG, JPG up to 10MB
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full bg-indigo-50 text-indigo-600"
                >
                  Upload Image
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {/* Image mapping logic would go here */}
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded border border-slate-100 bg-white flex items-center justify-center"
                  >
                    <Plus className="h-4 w-4 text-indigo-500 opacity-50" />
                  </div>
                ))}
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
