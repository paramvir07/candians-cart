import { RefObject } from "react";
// React 19 / @types/react v19+ changed useRef to return RefObject<T | null>
import { Image as ImageIcon, X, Tag, FileText, Save } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORIES = [
  "Fruits", "Vegetables", "Dairy", "Meat", "Bakery", "Beverages", "Snacks",
  "Household", "Oil & Ghee", "Pulses & Lentils", "Flour & Atta", "Rice",
  "Spices", "Pickles & Chutneys", "Instant Foods", "Frozen Foods",
  "Sweets & Mithai", "Dry Fruits & Nuts", "Tea & Coffee", "Sauces & Condiments",
  "Papad & Fryums", "Pooja / Religious Items", "Utensils", "Disposables",
  "Personal Care", "Other",
];

interface RightSidebarProps {
  // image
  imagePreview: string | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  // category
  category: string;
  onCategoryChange: (value: string) => void;
  // invoice
  InvoiceId: string;
  onInvoiceChange: (value: string) => void;
  // save button
  loading: boolean;
  buttonText: string;
  onSubmit: () => void;
}

export function RightSidebar({
  imagePreview,
  fileInputRef,
  onImageChange,
  onRemoveImage,
  category,
  onCategoryChange,
  InvoiceId,
  onInvoiceChange,
  loading,
  buttonText,
  onSubmit,
}: RightSidebarProps) {
  return (
    <div className="space-y-6">
      {/* ── Image Upload ── */}
      <Card className="border border-border/60 shadow-sm bg-card overflow-hidden">
        <CardHeader className="pb-4 pt-5 px-6">
          <CardTitle className="flex items-center gap-2.5 text-base font-semibold text-foreground">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-500/10 text-violet-600">
              <ImageIcon className="w-3.5 h-3.5" />
            </span>
            Product Image
          </CardTitle>
        </CardHeader>
        <Separator className="mb-0" />
        <CardContent className="p-6">
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            ref={fileInputRef}
            onChange={onImageChange}
          />
          {imagePreview ? (
            <div className="relative group rounded-xl overflow-hidden border border-border/60 bg-muted/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-52 object-contain p-3"
              />
              <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Replace
                </Button>
                <Button size="sm" variant="destructive" onClick={onRemoveImage}>
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
        </CardContent>
      </Card>

      {/* ── Category ── */}
      <Card className="border border-border/60 shadow-sm bg-card overflow-hidden">
        <CardHeader className="pb-4 pt-5 px-6">
          <CardTitle className="flex items-center gap-2.5 text-base font-semibold text-foreground">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-500/10 text-orange-600">
              <Tag className="w-3.5 h-3.5" />
            </span>
            Classification
          </CardTitle>
        </CardHeader>
        <Separator className="mb-0" />
        <CardContent className="p-6 space-y-5">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground/80">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select value={category} onValueChange={onCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ── Invoice ── */}
      <Card className="border border-border/60 shadow-sm bg-card overflow-hidden">
        <CardHeader className="pb-4 pt-5 px-6">
          <CardTitle className="flex items-center gap-2.5 text-base font-semibold text-foreground">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-sky-500/10 text-sky-600">
              <FileText className="w-3.5 h-3.5" />
            </span>
            Invoice Details
          </CardTitle>
        </CardHeader>
        <Separator className="mb-0" />
        <CardContent className="p-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground/80">
              Invoice ID <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Paste verified Invoice ID…"
              value={InvoiceId}
              onChange={(e) => onInvoiceChange(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              Required when creating a product or changing its price.
            </p>
          </div>
          <Link
            href="/store/invoice/add/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline underline-offset-2 transition-colors"
          >
            <FileText className="w-3 h-3" />
            Add a new Invoice
          </Link>
        </CardContent>
      </Card>

      {/* ── Desktop Save Button ── */}
      <div className="hidden lg:block">
        <Button
          onClick={onSubmit}
          disabled={loading}
          className="w-full gap-2 py-5 text-sm font-semibold"
        >
          <Save className="w-4 h-4" />
          {buttonText}
        </Button>
      </div>
    </div>
  );
}