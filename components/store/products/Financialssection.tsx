import { DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface FinancialsSectionProps {
  markup: string;
  tax: string;
  disposableFee: string;
  price: string;
  onChange: (field: string, value: string) => void;
}

export function FinancialsSection({
  markup,
  tax,
  disposableFee,
  price,
  onChange,
}: FinancialsSectionProps) {
  const base = parseFloat(price) || 0;
  const markupNum = parseFloat(markup) || 0;
  const taxNum = parseFloat(tax) || 0;
  const fee = parseFloat(disposableFee) || 0;

  const withMarkup = base * (1 + markupNum / 100);
  const withTax = withMarkup * (1 + taxNum / 100);
  const total = withTax + fee;

  // Local state to track the user's manual input for the helper field
  const [targetPriceStr, setTargetPriceStr] = useState<string>("");

  // Track focus to prevent overwriting the user's keystrokes while they type
  const [isTargetFocused, setIsTargetFocused] = useState(false);

  const [prevPrice, setPrevPrice] = useState(price);
  const [prevMarkup, setPrevMarkup] = useState(markup);

  if (price !== prevPrice || markup !== prevMarkup) {
    setPrevPrice(price);
    setPrevMarkup(markup);

    // ONLY auto-sync from the outside if the user IS NOT actively typing in this field
    if (!isTargetFocused) {
      if (base > 0 && !isNaN(markupNum)) {
        setTargetPriceStr((base * (1 + markupNum / 100)).toFixed(2));
      } else {
        setTargetPriceStr("");
      }
    }
  }

  const handleTargetPriceChange = (val: string) => {
    setTargetPriceStr(val);
    const target = parseFloat(val);

    // Auto-calculate the markup and push it to the parent state
    if (!isNaN(target) && base > 0) {
      const newMarkup = (target / base - 1) * 100;
      // Strip trailing .00 for cleaner integers
      onChange("markup", newMarkup.toFixed(2).replace(/\.00$/, ""));
    } else if (val === "") {
      onChange("markup", "");
    }
  };

  const handleTargetBlur = () => {
    setIsTargetFocused(false);
    // Clean up and format the number to .toFixed(2) when the user clicks away
    if (base > 0 && !isNaN(markupNum)) {
      setTargetPriceStr((base * (1 + markupNum / 100)).toFixed(2));
    }
  };

  const handleMarkupChange = (val: string) => {
    onChange("markup", val);
  };

  return (
    <Card className="border border-border/60 shadow-sm bg-card overflow-hidden">
      <CardHeader className="pb-4 pt-5 px-6">
        <CardTitle className="flex items-center gap-2.5 text-base font-semibold text-foreground">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600">
            <DollarSign className="w-3.5 h-3.5" />
          </span>
          Financials & Fees
        </CardTitle>
      </CardHeader>
      <Separator className="mb-0" />
      <CardContent className="p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* New Field: Target Selling Price */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground/80">
              Target Price (Pre-tax)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">
                $
              </span>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={targetPriceStr}
                onChange={(e) => handleTargetPriceChange(e.target.value)}
                onFocus={() => setIsTargetFocused(true)} // Suspend formatting
                onBlur={handleTargetBlur} // Resume formatting
                className="pl-7"
                disabled={base <= 0}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Auto-calculates markup
            </p>
          </div>

          {/* Markup */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground/80">
              Markup (%) <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              placeholder="30"
              min={30}
              max={35}
              value={markup}
              onChange={(e) => handleMarkupChange(e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground">Range: 30 – 35%</p>
          </div>

          {/* Tax Rate */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground/80">
              Tax Rate <span className="text-destructive">*</span>
            </Label>
            <Select value={tax} onValueChange={(v) => onChange("tax", v)}>
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
          </div>

          {/* Disposable Fee */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground/80">
              Disposable Fee (CAD)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">
                $
              </span>
              <Input
                type="number"
                step="0.01"
                placeholder="0.10"
                value={disposableFee}
                onChange={(e) => onChange("disposableFee", e.target.value)}
                className="pl-7"
              />
            </div>
          </div>
        </div>

        {/* Live price preview */}
        {price && markup && (
          <div className="rounded-lg bg-muted/50 border border-border/50 px-4 py-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
