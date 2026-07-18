"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Barcode,
  DollarSign,
  Loader2,
  Sparkles,
  X,
  Hash,
  Receipt,
} from "lucide-react";

interface MiscItemFormData {
  productName: string;
  primaryUPC: string;
  price: string;
  quantity: string;
  tax: string;
}

interface AddMiscItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: {
    productName: string;
    primaryUPC?: string;
    price: number;
    quantity: number;
    tax: number;
  }) => Promise<{ success: boolean; message: string }>;
}

const TAX_OPTIONS = [
  { label: "No Tax", description: "0%", value: "0" },
  { label: "GST", description: "5%", value: "0.05" },
  { label: "PST", description: "7%", value: "0.07" },
  { label: "GST + PST", description: "12%", value: "0.12" },
] as const;

const defaultForm: MiscItemFormData = {
  productName: "",
  primaryUPC: "",
  price: "",
  quantity: "1",
  tax: "",
};

export default function AddMiscItemModal({
  open,
  onOpenChange,
  onSubmit,
}: AddMiscItemModalProps) {
  const [form, setForm] = useState<MiscItemFormData>(defaultForm);
  const [errors, setErrors] = useState<Partial<MiscItemFormData>>({});
  const [isPending, startTransition] = useTransition();

  const set =
    (field: keyof MiscItemFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const setField = (field: keyof MiscItemFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<MiscItemFormData> = {};
    if (!form.productName.trim()) next.productName = "Product name is required";
    const parsedPrice = parseFloat(form.price);
    if (!form.price || isNaN(parsedPrice) || parsedPrice <= 0)
      next.price = "Enter a valid price before tax greater than $0.00";
    const parsedQty = parseInt(form.quantity);
    if (
      !form.quantity ||
      isNaN(parsedQty) ||
      parsedQty < 1 ||
      parsedQty > 99
    )
      next.quantity = "Quantity must be between 1 and 99";
    if (form.tax === "") next.tax = "Tax rate is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    startTransition(async () => {
      const payload = {
        productName: form.productName.trim(),
        primaryUPC: form.primaryUPC.trim() || undefined,
        price: Math.round(parseFloat(form.price) * 100),
        quantity: parseInt(form.quantity),
        tax: parseFloat(form.tax),
      };

      if (onSubmit) {
        const res = await onSubmit(payload);
        if (res.success) {
          setForm(defaultForm);
          onOpenChange(false);
        }
      } else {
        console.log(payload);
      }
    });
  };

  const handleClose = () => {
    if (isPending) return;
    setForm(defaultForm);
    setErrors({});
    onOpenChange(false);
  };

  const selectedTax = TAX_OPTIONS.find((o) => o.value === form.tax);
  const parsedPrice = parseFloat(form.price);
  const showTaxPreview =
    selectedTax && !isNaN(parsedPrice) && parsedPrice > 0;
  const taxAmount = showTaxPreview
    ? parsedPrice * parseFloat(selectedTax.value)
    : 0;
  const totalPrice = showTaxPreview ? parsedPrice + taxAmount : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        aria-describedby={undefined}
        className="sm:max-w-md p-0 gap-0 overflow-hidden border-border bg-card"
      >
        <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

        <div className="p-6 space-y-6">
          <DialogHeader className="space-y-0">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-foreground leading-tight">
                    Add Miscellaneous Item
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Item will be added to this store's catalogue
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isPending}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Product Name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="productName"
                className="flex items-center gap-1.5 text-sm font-medium text-foreground"
              >
                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                Product Name
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="productName"
                placeholder="e.g. Organic Honey Jar"
                value={form.productName}
                onChange={set("productName")}
                disabled={isPending}
                className={`h-10 bg-background border-input transition-colors focus-visible:ring-1 focus-visible:ring-primary ${
                  errors.productName
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }`}
              />
              {errors.productName && (
                <p className="text-xs text-destructive">{errors.productName}</p>
              )}
            </div>

            {/* UPC */}
            <div className="space-y-1.5">
              <Label
                htmlFor="primaryUPC"
                className="flex items-center gap-1.5 text-sm font-medium text-foreground"
              >
                <Barcode className="h-3.5 w-3.5 text-muted-foreground" />
                UPC / Barcode
                <span className="text-xs font-normal text-muted-foreground ml-1">
                  (optional)
                </span>
              </Label>
              <Input
                id="primaryUPC"
                placeholder="e.g. 012345678901"
                value={form.primaryUPC}
                onChange={set("primaryUPC")}
                disabled={isPending}
                className="h-10 bg-background border-input font-mono tracking-wider transition-colors focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            {/* Price + Quantity */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="price"
                  className="flex items-center gap-1.5 text-sm font-medium text-foreground"
                >
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  Price Before Tax
                  <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground select-none">
                    $
                  </span>
                  <Input
                    id="price"
                    type="number"
                    min={0.01}
                    step={0.01}
                    placeholder="0.00"
                    value={form.price}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || parseFloat(val) >= 0) set("price")(e);
                    }}
                    onBlur={() => {
                      const parsed = parseFloat(form.price);
                      if (!isNaN(parsed) && parsed > 0) {
                        setForm((prev) => ({
                          ...prev,
                          price: parsed.toFixed(2),
                        }));
                      }
                    }}
                    disabled={isPending}
                    className={`h-10 pl-7 bg-background border-input font-mono transition-colors focus-visible:ring-1 focus-visible:ring-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                      errors.price
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                  />
                </div>
                {errors.price && (
                  <p className="text-xs text-destructive">{errors.price}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="quantity"
                  className="flex items-center gap-1.5 text-sm font-medium text-foreground"
                >
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                  Quantity
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  max={99}
                  step={1}
                  placeholder="1"
                  value={form.quantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || parseInt(val) >= 0) set("quantity")(e);
                  }}
                  onBlur={() => {
                    const parsed = parseInt(form.quantity);
                    if (isNaN(parsed) || parsed < 1)
                      setForm((prev) => ({ ...prev, quantity: "1" }));
                    if (parsed > 99)
                      setForm((prev) => ({ ...prev, quantity: "99" }));
                  }}
                  disabled={isPending}
                  className={`h-10 bg-background border-input font-mono transition-colors focus-visible:ring-1 focus-visible:ring-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                    errors.quantity
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                />
                {errors.quantity && (
                  <p className="text-xs text-destructive">{errors.quantity}</p>
                )}
              </div>
            </div>

            {/* Tax */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
                Tax Rate
                <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.tax}
                onValueChange={(val) => setField("tax", val)}
                disabled={isPending}
              >
                <SelectTrigger
                  className={`h-10 bg-background border-input transition-colors focus:ring-1 focus:ring-primary ${
                    errors.tax
                      ? "border-destructive focus:ring-destructive"
                      : ""
                  }`}
                >
                  <SelectValue placeholder="Select tax rate…" />
                </SelectTrigger>
                <SelectContent>
                  {TAX_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex items-center gap-2">
                        <span className="font-medium">{opt.label}</span>
                        <span className="text-muted-foreground text-xs">
                          ({opt.description})
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tax && (
                <p className="text-xs text-destructive">{errors.tax}</p>
              )}
            </div>

            {/* Tax preview */}
            {showTaxPreview && (
              <div className="rounded-lg border border-border bg-muted/40 px-3.5 py-2.5 space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Price Breakdown
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-foreground/80">
                    <span>Price before tax</span>
                    <span className="font-mono">${parsedPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-foreground/80">
                    <span>
                      {selectedTax.label} ({selectedTax.description})
                    </span>
                    <span className="font-mono">+${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between font-semibold text-foreground">
                    <span>Total per item</span>
                    <span className="font-mono">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-border" />

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
              className="flex-1 h-10 border-border text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 h-10 font-semibold gap-2"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Package className="h-4 w-4" />
              )}
              {isPending ? "Adding..." : "Add Item"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}