"use client";

import { RefObject, useEffect, useRef, useState } from "react";
import {
  Image as ImageIcon,
  X,
  Tag,
  FileText,
  Save,
  Loader2,
  Check,
  Copy,
  Camera,
  FolderOpen,
} from "lucide-react";
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
];

interface InvoiceData {
  _id: string;
  InvoiceNumber: number;
  DateInvoiceCame: string;
}

interface RightSidebarProps {
  storeId?: string;
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
  productId?: string;
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
  productId,
}: RightSidebarProps) {
  const [recentInvoices, setRecentInvoices] = useState<InvoiceData[]>([]);
  const [fetchingInvoices, setFetchingInvoices] = useState(false);

  /**
   * Separate hidden input with capture="environment".
   *
   * Why two inputs instead of one?
   * - fileInputRef (no capture): opens the OS file picker / gallery.
   *   On iOS this also shows a "Take Photo" option in its sheet, but on
   *   Android 14+ Chrome the camera option was silently removed from the
   *   default picker — so gallery-only is all you get from this one.
   * - cameraInputRef (capture="environment"): bypasses the picker entirely
   *   and opens the camera app directly on every Android version and iOS.
   *   Desktop browsers ignore the capture attribute and fall back to the
   *   normal file picker, which is acceptable.
   */
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchInvoices = async () => {
      setFetchingInvoices(true);
      try {
        const response = await getTop5Invoices(storeId, productId);
        if (isMounted && response.success && response.data) {
          setRecentInvoices(response.data as InvoiceData[]);
        }
      } catch (error) {
        console.error("Failed to fetch recent invoices", error);
      } finally {
        if (isMounted) setFetchingInvoices(false);
      }
    };
    fetchInvoices();
    return () => {
      isMounted = false;
    };
  }, [storeId, productId]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ── Image Upload ── */}
      <Card className="border border-border/60 shadow-sm bg-card overflow-hidden">
        <CardHeader className="pb-3 pt-4 px-4 sm:pb-4 sm:pt-5 sm:px-6">
          <CardTitle className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-base font-semibold text-foreground">
            <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-violet-500/10 text-violet-600 shrink-0">
              <ImageIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </span>
            Product Image
          </CardTitle>
        </CardHeader>
        <Separator className="mb-0" />
        <CardContent className="p-4 sm:p-6">
          {/* Hidden: gallery / file picker (also the tap-to-upload target) */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={onImageChange}
          />

          {/* Hidden: direct camera capture — works on all iOS & Android versions */}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            ref={cameraInputRef}
            onChange={onImageChange}
          />

          {imagePreview ? (
            /**
             * PREVIEW STATE
             * Drop zone is hidden; show the image + three action buttons so
             * the user can swap via camera, swap via gallery, or remove.
             * The hover overlay is kept for desktop mouse users.
             */
            <div className="space-y-3">
              <div className="relative group rounded-xl overflow-hidden border border-border/60 bg-muted/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-40 sm:h-52 object-contain p-2 sm:p-3"
                />
                {/* Desktop hover overlay */}
                <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center gap-2">
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
                    onClick={onRemoveImage}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/*
               * Three explicit buttons — always visible so touch users
               * never have to rely on the hover overlay.
               *
               * Camera  → cameraInputRef (capture="environment")
               * Gallery → fileInputRef   (normal file picker / photo library)
               * Remove  → clears the image
               */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1 sm:gap-1.5 text-[11px] sm:text-xs px-2 sm:px-3"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  <span className="truncate">Camera</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1 sm:gap-1.5 text-[11px] sm:text-xs px-2 sm:px-3"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FolderOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  <span className="truncate">Gallery</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1 sm:gap-1.5 text-[11px] sm:text-xs px-2 sm:px-3 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60 hover:bg-destructive/5"
                  onClick={onRemoveImage}
                >
                  <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  <span className="truncate">Remove</span>
                </Button>
              </div>
            </div>
          ) : (
            /**
             * EMPTY STATE
             * Tap-to-upload covers gallery (and shows the full iOS sheet
             * with Take Photo + Photo Library + Files).
             * Take Photo button provides a direct camera path — critical on
             * Android 14+ where the default picker no longer has a camera
             * option, and convenient on all other devices too.
             */
            <div className="space-y-3">
              {/* Tap-to-upload → opens gallery / file picker */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border hover:border-primary/50 rounded-xl transition-colors bg-muted/20 hover:bg-primary/5 flex flex-col items-center justify-center gap-2 py-8 sm:py-10 group"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="text-center px-4">
                  <p className="text-xs sm:text-sm font-medium text-foreground/70 group-hover:text-primary transition-colors">
                    Tap to upload
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">
                    PNG, JPG, WebP · max 4 MB
                  </p>
                </div>
              </button>

              {/* Take Photo → direct camera, full-width since gallery is above */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs w-full"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="w-3.5 h-3.5 shrink-0" />
                Take Photo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Category ── */}
      <Card className="border border-border/60 shadow-sm bg-card overflow-hidden">
        <CardHeader className="pb-3 pt-4 px-4 sm:pb-4 sm:pt-5 sm:px-6">
          <CardTitle className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-base font-semibold text-foreground">
            <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-orange-500/10 text-orange-600 shrink-0">
              <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </span>
            Classification
          </CardTitle>
        </CardHeader>
        <Separator className="mb-0" />
        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground/80">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select value={category} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-full">
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
        <CardHeader className="pb-3 pt-4 px-4 sm:pb-4 sm:pt-5 sm:px-6">
          <CardTitle className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-base font-semibold text-foreground">
            <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-sky-500/10 text-sky-600 shrink-0">
              <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </span>
            Invoice Details
          </CardTitle>
        </CardHeader>
        <Separator className="mb-0" />
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground/80">
              Invoice ID <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Paste verified Invoice ID…"
              value={InvoiceId}
              onChange={(e) => onInvoiceChange(e.target.value)}
              className="font-mono text-xs sm:text-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              Required when creating a product or changing its price.
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Recent Invoices
              </Label>
              {fetchingInvoices && (
                <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
              )}
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
                const dateLabel = invoice.DateInvoiceCame
                  ? new Date(invoice.DateInvoiceCame).toLocaleDateString(
                      undefined,
                      { month: "short", day: "numeric", year: "2-digit" },
                    )
                  : "—";

                return (
                  <div
                    key={invoice._id}
                    className={`flex items-center gap-2 p-2 sm:p-2.5 rounded-lg border transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border/50 bg-muted/20 hover:bg-muted/50"
                    }`}
                  >
                    <FileText
                      className={`w-3.5 h-3.5 shrink-0 hidden xs:block ${
                        isSelected ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-mono truncate leading-tight ${
                          isSelected
                            ? "font-semibold text-primary"
                            : "text-foreground/80"
                        }`}
                      >
                        {displayName}
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                        {dateLabel}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant={isSelected ? "default" : "secondary"}
                      size="sm"
                      className="h-7 text-[10px] sm:text-[11px] px-2 sm:px-2.5 shrink-0"
                      onClick={() => onInvoiceChange(invoice._id)}
                      disabled={isSelected}
                    >
                      {isSelected ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <>
                          <Copy className="w-3 h-3 mr-1 shrink-0" />
                          <span>Use</span>
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
            <FileText className="w-3 h-3 shrink-0" />
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
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {buttonText}
        </Button>
      </div>
    </div>
  );
}
