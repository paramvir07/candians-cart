"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  PackageIcon,
  PlusCircleIcon,
  Loader2,
  ShieldCheckIcon,
  ArrowLeftIcon,
  ImageIcon,
  X,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { categories as CATEGORIES } from "@/lib/categories";
import { createCashierProduct } from "@/actions/cashier/CashierProduct";
import { CashierCreateProductSchema } from "@/zod/schemas/cashier/cashierProductSchema";
import { AddtoCart } from "@/actions/customer/ProductAndStore/Cart.Action";

// ── types ─────────────────────────────────────────────────────────────────────

interface ProductFormData {
  name: string;
  primaryUPC: string;
  price: string;
  finalPrice: string;
  description: string;
  category: string;
  markup: string;
  tax: string;
  disposableFee: string;
  stock: boolean;
  subsidised: boolean;
  isFeatured: boolean;
  isMeasuredInWeight: boolean;
  UOM: "lb" | "kg" | "";
  PriceDrop: boolean;
}

// ── constants ─────────────────────────────────────────────────────────────────

const TAX_OPTIONS = [
  { label: "No Tax (0%)", value: "0" },
  { label: "GST 5%", value: "0.05" },
  { label: "PST 7%", value: "0.07" },
  { label: "GST + PST 12%", value: "0.12" },
];

const UOM_OPTIONS = [
  { label: "lb (pound)", value: "lb" },
  { label: "kg (kilogram)", value: "kg" },
];

const DEFAULT_FORM: ProductFormData = {
  name: "",
  primaryUPC: "",
  price: "",
  finalPrice: "",
  description: "",
  category: "",
  markup: "",
  tax: "0.05",
  disposableFee: "",
  stock: true,
  subsidised: false,
  isFeatured: false,
  isMeasuredInWeight: false,
  UOM: "",
  PriceDrop: false,
};

// ── sub‑components ────────────────────────────────────────────────────────────

function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="flex flex-wrap items-center gap-1 text-sm font-medium leading-none">
        {label}
        {required && <span className="text-destructive">*</span>}
        {hint && (
          <span className="font-normal text-muted-foreground/70 text-xs">
            · {hint}
          </span>
        )}
      </Label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <span className="inline-block h-1 w-1 rounded-full bg-destructive" />
          {error}
        </p>
      )}
    </div>
  );
}

function ToggleCard({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onCheckedChange(!checked)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onCheckedChange(!checked);
        }
      }}
      className={`group flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all duration-200 cursor-pointer ${
        checked
          ? "border-primary/30 bg-primary/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          : "border-border bg-card hover:border-border/80 hover:bg-muted/30"
      }`}
    >
      <div className="mr-3 min-w-0">
        <p
          className={`text-sm font-medium leading-tight transition-colors ${checked ? "text-foreground" : "text-foreground/80"}`}
        >
          {label}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {description}
        </p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        onClick={(e) => e.stopPropagation()}
        className="shrink-0 pointer-events-none"
      />
    </div>
  );
}

function SectionLabel({
  label,
  icon,
}: {
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon && <span className="text-muted-foreground/70">{icon}</span>}
      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80">
        {label}
      </span>
      <div className="flex-1 border-t border-border/60" />
    </div>
  );
}

// ── AddQtyDialog ──────────────────────────────────────────────────────────────

interface AddQtyDialogProps {
  open: boolean;
  productName: string;
  isMeasuredInWeight: boolean;
  UOM: string;
  onConfirm: (qty: number) => Promise<void>;
  onClose: () => void;
}

function AddQtyDialog({
  open,
  productName,
  isMeasuredInWeight,
  UOM,
  onConfirm,
  onClose,
}: AddQtyDialogProps) {
  const [qty, setQty] = useState("1");
  const [adding, setAdding] = useState(false);

  const qtyNum = parseFloat(qty);
  const isDecimal = qtyNum % 1 !== 0;
  const isValid =
    !isNaN(qtyNum) && qtyNum > 0 && (isMeasuredInWeight || !isDecimal);
  const decimalError =
    !isMeasuredInWeight && isDecimal
      ? "Quantity must be a whole number for this item"
      : undefined;

  async function handleConfirm() {
    if (!isValid) return;
    setAdding(true);
    try {
      // for weight: trim to 3 decimal places; for count: floor to integer
      const finalQty = isMeasuredInWeight
        ? Number(parseFloat(qty).toFixed(3))
        : Math.floor(qtyNum);
      await onConfirm(finalQty);
    } finally {
      setAdding(false);
    }
  }

  const prevOpen = useRef(false);
  if (open && !prevOpen.current) setQty(isMeasuredInWeight ? "0.1" : "1");
  prevOpen.current = open;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add to Cart</DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{productName}</span>{" "}
            was created. Enter a quantity to add it to the cart.
          </p>

          <Field
            label={
              isMeasuredInWeight ? `Quantity (${UOM || "unit"})` : "Quantity"
            }
            hint={
              isMeasuredInWeight ? "decimals allowed" : "whole numbers only"
            }
            error={decimalError}
            required
          >
            <Input
              type="text"
              inputMode={isMeasuredInWeight ? "decimal" : "numeric"}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder={isMeasuredInWeight ? "e.g. 1.5" : "e.g. 2"}
              autoFocus
              className={decimalError ? "border-destructive" : ""}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isValid) handleConfirm();
              }}
            />
          </Field>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={adding}>
            Skip
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValid || adding}
            className="gap-2"
          >
            {adding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PlusCircleIcon className="h-4 w-4" />
            )}
            Add to Cart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function CashierCreateProductForm({
  customerId,
}: {
  customerId: string;
}) {
  const [form, setForm] = useState<ProductFormData>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof ProductFormData, string>>
  >({});

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // qty dialog state
  const [qtyDialog, setQtyDialog] = useState<{
    open: boolean;
    productId: string;
    productName: string;
    isMeasuredInWeight: boolean;
    UOM: string;
  }>({
    open: false,
    productId: "",
    productName: "",
    isMeasuredInWeight: false,
    UOM: "",
  });

  const router = useRouter();

  function set<K extends keyof ProductFormData>(
    key: K,
    value: ProductFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key])
      setFormErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function calcMissing(
    changed: "price" | "markup" | "finalPrice",
    overrides?: Partial<
      Pick<ProductFormData, "price" | "markup" | "finalPrice">
    >,
  ) {
    const price = parseFloat(overrides?.price ?? form.price);
    const markup = parseFloat(overrides?.markup ?? form.markup);
    const finalPrice = parseFloat(overrides?.finalPrice ?? form.finalPrice);

    const hasPrice = !isNaN(price) && price > 0;
    const hasMarkup = !isNaN(markup) && markup >= 0;
    const hasFinal = !isNaN(finalPrice) && finalPrice > 0;

    if (changed === "price" || changed === "markup") {
      if (hasPrice && hasMarkup) {
        const computed = (price * (1 + markup / 100)).toFixed(2);
        setForm((prev) => ({ ...prev, finalPrice: computed }));
      }
    } else if (changed === "finalPrice") {
      if (hasFinal && hasMarkup) {
        const computed = (finalPrice / (1 + markup / 100)).toFixed(2);
        setForm((prev) => ({ ...prev, price: computed }));
      } else if (hasFinal && hasPrice) {
        const computed = (((finalPrice - price) / price) * 100).toFixed(2);
        setForm((prev) => ({ ...prev, markup: computed }));
      }
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast.error("File size must be less than 4MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleRemoveImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function validate(): boolean {
    const rawPayload = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      markup: parseFloat(form.markup),
      tax: parseFloat(form.tax),
      disposableFee: form.disposableFee ? parseFloat(form.disposableFee) : 0,
      price: Math.round(parseFloat(form.finalPrice || form.price) * 100),
      stock: form.stock,
      subsidised: form.subsidised,
      isFeatured: form.isFeatured,
      isMeasuredInWeight: form.isMeasuredInWeight,
      UOM: form.isMeasuredInWeight && form.UOM !== "" ? form.UOM : undefined,
      PriceDrop: form.PriceDrop,
      images: [],
      ...(form.primaryUPC.trim() ? { primaryUPC: form.primaryUPC.trim() } : {}),
    };

    const result = CashierCreateProductSchema.safeParse(rawPayload);

    if (!result.success) {
      const next: Partial<Record<keyof ProductFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof ProductFormData;
        if (field && !next[field]) next[field] = issue.message;
      }
      if (!next.price && !next.finalPrice) {
        const priceIssue = result.error.issues.find(
          (i) => i.path[0] === "price",
        );
        if (priceIssue) next.price = priceIssue.message;
      }

      setFormErrors(next);
      toast.error("Please fix the following errors:", {
        description: result.error.issues.map((i) => i.message).join("\n"),
      });
      return false;
    }

    setFormErrors({});
    return true;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);

    try {
      let finalImages: { url: string }[] = [];
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

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        markup: parseFloat(form.markup),
        tax: parseFloat(form.tax),
        disposableFee: form.disposableFee
          ? Math.round(parseFloat(form.disposableFee) * 100)
          : 0,
        price: Math.round(parseFloat(form.finalPrice || form.price) * 100),
        stock: form.stock,
        subsidised: form.subsidised,
        isFeatured: form.isFeatured,
        isMeasuredInWeight: form.isMeasuredInWeight,
        UOM: form.isMeasuredInWeight && form.UOM !== "" ? form.UOM : undefined,
        PriceDrop: form.PriceDrop,
        images: finalImages,
        ...(form.primaryUPC.trim()
          ? { primaryUPC: form.primaryUPC.trim() }
          : {}),
      };

      const res = await createCashierProduct(payload, customerId);
      if (!res.success || !res.data) {
        toast.error(res.message || "Error creating product");
        return;
      }

      toast.success("Product created!");

      // open qty dialog
      setQtyDialog({
        open: true,
        productId: res.data._id.toString(),
        productName: res.data.name,
        isMeasuredInWeight: form.isMeasuredInWeight,
        UOM: form.UOM,
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddToCart(qty: number) {
    const res = await AddtoCart(qtyDialog.productId, customerId, qty);

    if (!res?.success) {
      toast.error("Failed to add to cart");
      return;
    }

    toast.success("Added to cart!");
    router.push(`/cashier/customer/${customerId}/cart`);
  }

  function handleQtyDialogClose() {
    setQtyDialog((prev) => ({ ...prev, open: false }));
    router.push(`/cashier/customer/${customerId}/cart`);
  }

  // ── render ──
  return (
    <>
      <AddQtyDialog
        open={qtyDialog.open}
        productName={qtyDialog.productName}
        isMeasuredInWeight={qtyDialog.isMeasuredInWeight}
        UOM={qtyDialog.UOM}
        onConfirm={handleAddToCart}
        onClose={handleQtyDialogClose}
      />

      <div className="mx-auto max-w-3xl px-6 py-8 sm:px-8 lg:px-10">
        <Button
          onClick={() => router.push(`/cashier/customer/${customerId}/cart`)}
          variant="outline"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Cart
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <PackageIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">New Product</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Fill in the details to add a product to the catalogue
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* flags */}
          <section>
            <SectionLabel
              icon={<ShieldCheckIcon className="h-3 w-3" />}
              label="Flags"
            />
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ToggleCard
                label="In Stock"
                description="Product is currently available"
                checked={form.stock}
                onCheckedChange={(v) => set("stock", v)}
              />
              <ToggleCard
                label="Featured"
                description="Show on featured section"
                checked={form.isFeatured}
                onCheckedChange={(v) => set("isFeatured", v)}
              />
              <ToggleCard
                label="Subsidised"
                description="Item is subsidised"
                checked={form.subsidised}
                onCheckedChange={(v) => set("subsidised", v)}
              />
              <ToggleCard
                label="Measured by Weight"
                description="Sold per lb / kg — enables unit selection below"
                checked={form.isMeasuredInWeight}
                onCheckedChange={(v) => {
                  set("isMeasuredInWeight", v);
                  if (!v) set("UOM", "");
                }}
              />
            </div>
          </section>

          {/* product image */}
          <section>
            <SectionLabel
              icon={<ImageIcon className="h-3 w-3" />}
              label="Product Image"
            />
            <div className="mt-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              {imagePreview ? (
                <div className="relative w-full overflow-hidden rounded-xl border border-border bg-muted/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="h-48 w-full object-contain p-2"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all hover:bg-black/30 hover:opacity-100">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="gap-1.5 shadow"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Change
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="gap-1.5 shadow"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-3.5 w-3.5" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted ring-1 ring-border">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Click to upload image
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      PNG, JPG, WEBP · Max 4 MB
                    </p>
                  </div>
                </button>
              )}
            </div>
          </section>

          {/* core details */}
          <section>
            <SectionLabel label="Core Details" />
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Product Name" required error={formErrors.name}>
                  <Input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g. Kehar Dry Soya Beans 300g"
                    className={
                      formErrors.name
                        ? "border-destructive ring-destructive/20"
                        : ""
                    }
                  />
                </Field>
              </div>

              <Field
                label="Base Price (CAD)"
                required
                error={formErrors.price}
                hint="auto-calculated if empty"
              >
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                    $
                  </span>
                  <Input
                    className={`pl-7 ${formErrors.price ? "border-destructive" : ""}`}
                    value={form.price}
                    onChange={(e) => {
                      set("price", e.target.value);
                      calcMissing("price", { price: e.target.value });
                    }}
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </Field>

              <Field
                label="Markup %"
                required
                error={formErrors.markup}
                hint="auto-calculated if empty"
              >
                <div className="relative">
                  <Input
                    className={`pr-7 ${formErrors.markup ? "border-destructive" : ""}`}
                    value={form.markup}
                    onChange={(e) => {
                      set("markup", e.target.value);
                      calcMissing("markup", { markup: e.target.value });
                    }}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 55.68"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                    %
                  </span>
                </div>
              </Field>

              <div className="sm:col-span-2">
                <Field
                  label="Final Price (CAD)"
                  hint="after markup · auto-calculated if empty"
                >
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                      $
                    </span>
                    <Input
                      className="pl-7 border-primary/40 bg-primary/2 focus-visible:ring-primary/30"
                      value={form.finalPrice}
                      onChange={(e) => {
                        set("finalPrice", e.target.value);
                        calcMissing("finalPrice", {
                          finalPrice: e.target.value,
                        });
                      }}
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground/70 mt-1">
                    Fill any two fields — the third is calculated automatically
                    on blur.
                  </p>
                </Field>
              </div>

              <Field label="Primary UPC" hint="Optional">
                <Input
                  value={form.primaryUPC}
                  onChange={(e) => set("primaryUPC", e.target.value)}
                  placeholder="Barcode / UPC"
                  className="font-mono text-sm tracking-wider"
                />
              </Field>

              <Field label="Category" required error={formErrors.category}>
                <Select
                  value={form.category}
                  onValueChange={(v) => set("category", v)}
                >
                  <SelectTrigger
                    className={formErrors.category ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Tax Rate">
                <Select value={form.tax} onValueChange={(v) => set("tax", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TAX_OPTIONS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Disposable Fee (CAD)" hint="e.g. milk carton fee">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                    $
                  </span>
                  <Input
                    className="pl-7"
                    value={form.disposableFee}
                    onChange={(e) => set("disposableFee", e.target.value)}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </Field>

              <Field
                label="Unit of Measurement"
                required={form.isMeasuredInWeight}
                error={formErrors.UOM}
              >
                <div
                  className="relative"
                  title={
                    !form.isMeasuredInWeight
                      ? 'Enable "Measured by Weight" to select a unit'
                      : undefined
                  }
                >
                  <Select
                    value={form.UOM}
                    onValueChange={(v) => set("UOM", v as "lb" | "kg")}
                    disabled={!form.isMeasuredInWeight}
                  >
                    <SelectTrigger
                      className={[
                        formErrors.UOM ? "border-destructive" : "",
                        !form.isMeasuredInWeight
                          ? "cursor-not-allowed opacity-50"
                          : "",
                      ].join(" ")}
                    >
                      <SelectValue
                        placeholder={
                          form.isMeasuredInWeight
                            ? "Select unit"
                            : "Enable weight first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {UOM_OPTIONS.map((u) => (
                        <SelectItem key={u.value} value={u.value}>
                          {u.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Field>

              <div className="sm:col-span-2">
                <Field label="Description" hint="Optional">
                  <textarea
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Short product description…"
                    rows={3}
                    className="flex w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* actions */}
          <div className="flex items-center justify-between border-t border-border pt-6">
            <p className="text-xs text-muted-foreground">* Required fields</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={submitting}
                onClick={() =>
                  router.push(`/cashier/customer/${customerId}/cart`)
                }
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Creating…
                  </>
                ) : (
                  <>
                    <PlusCircleIcon className="h-4 w-4" /> Create Product
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
