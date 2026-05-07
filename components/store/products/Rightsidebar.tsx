"use client";

import { RefObject, useEffect, useState } from "react";
import { Image as ImageIcon, X, Tag, FileText, Save, Loader2, Check, Copy } from "lucide-react";
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
import { getTop5Invoices } from "@/actions/store/invoice/getInvoices"; 

const CATEGORIES = [
  "Fruits", "Vegetables", "Dairy", "Meat", "Bakery", "Beverages", "Snacks",
  "Household", "Oil & Ghee", "Pulses & Lentils", "Flour & Atta", "Rice",
  "Spices", "Pickles & Chutneys", "Instant Foods", "Frozen Foods",
  "Sweets & Mithai", "Dry Fruits & Nuts", "Tea & Coffee", "Sauces & Condiments",
  "Papad & Fryums", "Pooja / Religious Items", "Utensils", "Disposables",
  "Personal Care", "Other",
];

// 1. Strict Typing to avoid `any`
interface InvoiceData {
  _id: string;
  InvoiceNumber: number;
  DateInvoiceCame: string;
}

interface RightSidebarProps {
  storeId?: string; // Optional so it doesn't break for store owners
  imagePreview: string | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  category: string;
  onCategoryChange: (value: string) => void;
  InvoiceId: string;
  onInvoiceChange: (value: string) => void;
  loading: boolean;
  buttonText: string;
  onSubmit: () => void;
}

export function RightSidebar({
  storeId,
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
  
  const [recentInvoices, setRecentInvoices] = useState<InvoiceData[]>([]);
  const [fetchingInvoices, setFetchingInvoices] = useState(false);

  useEffect(() => {
    let isMounted = true; // Cleanup flag to prevent memory leaks

    const fetchInvoices = async () => {
      setFetchingInvoices(true);
      try {
        // Falls back to session in the backend if storeId is undefined
        const response = await getTop5Invoices(storeId);
        if (isMounted && response.success && response.data) {
          setRecentInvoices(response.data as InvoiceData[]);
        }
      } catch (error) {
        console.error("Candian Cart: Failed to fetch recent invoices", error);
      } finally {
        if (isMounted) setFetchingInvoices(false);
      }
    };

    fetchInvoices();

    return () => {
      isMounted = false; // Cleanup on unmount
    };
  }, [storeId]);

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

          {/* Top 5 Recent Invoices Wrapper */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Recent Invoices
              </Label>
              {fetchingInvoices && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
            </div>

            {!fetchingInvoices && recentInvoices.length === 0 && (
              <p className="text-xs text-muted-foreground italic">
                No recent invoices found for this store.
              </p>
            )}

            <div className="space-y-2">
              {recentInvoices.map((invoice) => {
                const isSelected = InvoiceId === invoice._id;
                const displayName = invoice.InvoiceNumber || invoice._id;
                const DateInvoiceCame = invoice.DateInvoiceCame ? new Date(invoice.DateInvoiceCame).toLocaleDateString() : "Unknown date";

                return (
                  <div 
                    key={invoice._id} 
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                      isSelected ? "border-primary bg-primary/5" : "border-border/50 bg-muted/20 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FileText className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-xs font-mono truncate ${isSelected ? "font-semibold text-primary" : "text-foreground/80"}`}>
                        {displayName}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {DateInvoiceCame}
                    </p>
                    <Button
                      type="button"
                      variant={isSelected ? "default" : "secondary"}
                      size="sm"
                      className="h-6 text-[10px] px-2.5 shrink-0 ml-2"
                      onClick={() => onInvoiceChange(invoice._id)}
                      disabled={isSelected}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3 h-3 mr-1" /> Selected
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 mr-1" /> Use ID
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

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
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {buttonText}
        </Button>
      </div>
    </div>
  );
}