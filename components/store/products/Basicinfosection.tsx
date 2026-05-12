import { Package, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BasicInfoSectionProps {
  name: string;
  description: string;
  primaryUPC: string;
  isMeasuredInWeight: string;
  UOM: string;
  stock: string;
  isFeatured: string;
  price: string;
  onChange: (field: string, value: string) => void;
}

export function BasicInfoSection({
  name,
  description,
  primaryUPC,
  isMeasuredInWeight,
  UOM,
  stock,
  isFeatured,
  price,
  onChange,
}: BasicInfoSectionProps) {
  const upcDigitCount = primaryUPC.replace(/\D/g, "").length;

  return (
    <Card className="border border-border/60 shadow-sm bg-card overflow-hidden">
      <CardHeader className="pb-4 pt-5 px-6">
        <CardTitle className="flex items-center gap-2.5 text-base font-semibold text-foreground">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600">
            <Package className="w-3.5 h-3.5" />
          </span>
          Basic Information
        </CardTitle>
      </CardHeader>

      <Separator className="mb-0" />

      <CardContent className="p-6 space-y-5">
        {/* Name */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground/80">
            Product Name <span className="text-destructive">*</span>
          </Label>
          <Input
            placeholder="e.g. Organic Whole Milk"
            value={name}
            onChange={(e) => onChange("name", e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground/80">
            Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            placeholder="Describe the product — ingredients, weight, key features…"
            value={description}
            onChange={(e) => onChange("description", e.target.value)}
            className="min-h-32 resize-none"
          />
        </div>

        {/* UPC + Measurement Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground/80">
              Primary UPC Barcode
            </Label>

            <div className="relative">
              <Input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={14}
                placeholder="e.g. 123456789012"
                value={primaryUPC}
                onChange={(e) =>
                  onChange("primaryUPC", e.target.value.replace(/\D/g, ""))
                }
                className="pr-16"
              />

              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground select-none">
                {upcDigitCount} digits
              </span>
            </div>

            <p className="text-[11px] text-muted-foreground">Barcode number</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground/80">
              Measurement Type
            </Label>
            <Select
              value={isMeasuredInWeight}
              onValueChange={(v) => onChange("isMeasuredInWeight", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">Sold by Unit/Item</SelectItem>
                <SelectItem value="true">Sold by Weight</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* UOM — conditional */}
        {isMeasuredInWeight === "true" && (
          <div className="pt-2 animate-fade-in-up space-y-1.5">
            <Label className="text-sm font-medium text-foreground/80">
              Unit of Measurement (UOM)
            </Label>
            <Input
              placeholder="e.g. kg"
              value={UOM}
              onChange={(e) => onChange("UOM", e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground">
              e.g. kg, lbs, grams, liters
            </p>
          </div>
        )}

        {/* Stock + Featured */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground/80">
              Stock Status <span className="text-destructive">*</span>
            </Label>
            <Select value={stock} onValueChange={(v) => onChange("stock", v)}>
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
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground/80">
              Featured Status <span className="text-destructive">*</span>
            </Label>
            <Select
              value={isFeatured}
              onValueChange={(v) => onChange("isFeatured", v)}
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
          </div>
        </div>

        {/* Base Price */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground/80">
            Base Price (CAD) <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">
              $
            </span>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={price}
              onChange={(e) => onChange("price", e.target.value)}
              className="pl-7"
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Stored as: {Math.round((parseFloat(price) || 0) * 100)} cents
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
