"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { SlidersHorizontal, X, Check, AlertCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductCategory, TaxRate } from "@/types/store/products.types";
import { ProductFilters } from "@/actions/admin/products/getProductsFiltered.action";

// ── Constants ─────────────────────────────────────────────────────
const CATEGORIES: { label: ProductCategory; emoji: string }[] = [
  { label: "Fruits", emoji: "🥭" },
  { label: "Vegetables", emoji: "🥦" },
  { label: "Dairy", emoji: "🥛" },
  { label: "Meat", emoji: "🥩" },
  { label: "Bakery", emoji: "🍞" },
  { label: "Beverages", emoji: "🧃" },
  { label: "Snacks", emoji: "🍿" },
  { label: "Household", emoji: "🧹" },
  { label: "Oil & Ghee", emoji: "🫙" },
  { label: "Flour & Atta", emoji: "🌾" },
  { label: "Pulses & Lentils", emoji: "🫘" },
  { label: "Rice", emoji: "🍚" },
  { label: "Spices", emoji: "🌶️" },
  { label: "Pickles & Chutneys", emoji: "🥒" },
  { label: "Instant Foods", emoji: "🍜" },
  { label: "Frozen Foods", emoji: "🧊" },
  { label: "Sweets & Mithai", emoji: "🍬" },
  { label: "Dry Fruits & Nuts", emoji: "🥜" },
  { label: "Tea & Coffee", emoji: "☕" },
  { label: "Sauces & Condiments", emoji: "🫙" },
  { label: "Papad & Fryums", emoji: "🥨" },
  { label: "Pooja / Religious Items", emoji: "🪔" },
  { label: "Utensils", emoji: "🍳" },
  { label: "Disposables", emoji: "🥡" },
  { label: "Personal Care", emoji: "🧴" },
  { label: "Other", emoji: "📦" },
];

const TAX_OPTIONS: { label: string; value: TaxRate }[] = [
  { label: "No Tax (0%)", value: 0.0 },
  { label: "GST only (5%)", value: 0.05 },
  { label: "PST only (7%)", value: 0.07 },
  { label: "GST + PST (12%)", value: 0.12 },
];

const SORT_OPTIONS: { label: string; value: ProductFilters["sortBy"] }[] = [
  { label: "Recommended", value: "recommended" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Name A → Z", value: "name_asc" },
];

const MAX_PRICE_DOLLARS = 5000;
const MAX_PRICE_CENTS = MAX_PRICE_DOLLARS * 100;

// ── Hooks ─────────────────────────────────────────────────────────
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

// ── Section wrapper ───────────────────────────────────────────────
const FilterSection = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-3">
    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
      {label}
    </p>
    {children}
  </div>
);

// ── Pill toggle ───────────────────────────────────────────────────
const Pill = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 w-full rounded-xl text-sm font-medium transition-all border px-3 py-2.5 text-left",
      active
        ? "bg-primary text-primary-foreground border-primary shadow-sm"
        : "bg-background text-foreground border-border hover:border-primary/50 hover:bg-primary/5",
    )}
  >
    {children}
    {active && <Check className="ml-auto h-3.5 w-3.5 shrink-0" />}
  </button>
);

// ── Range input pair ──────────────────────────────────────────────
function RangeInputs({
  minVal,
  maxVal,
  absMin,
  absMax,
  step,
  format,
  parse,
  onMinChange,
  onMaxChange,
  minLabel,
  maxLabel,
  errorMin,
  errorMax,
}: {
  minVal: number;
  maxVal: number;
  absMin: number;
  absMax: number;
  step: number;
  format: (v: number) => string;
  parse: (s: string) => number;
  onMinChange: (v: number) => void;
  onMaxChange: (v: number) => void;
  minLabel?: string;
  maxLabel?: string;
  errorMin?: string | null;
  errorMax?: string | null;
}) {
  const [minRaw, setMinRaw] = useState(format(minVal));
  const [maxRaw, setMaxRaw] = useState(format(maxVal));

  useEffect(() => setMinRaw(format(minVal)), [minVal, format]);
  useEffect(() => setMaxRaw(format(maxVal)), [maxVal, format]);

  const commitMin = () => {
    const parsed = parse(minRaw);
    if (isNaN(parsed) || parsed < absMin) onMinChange(absMin);
    else if (parsed >= maxVal) onMinChange(maxVal - step);
    else onMinChange(parsed);
  };

  const commitMax = () => {
    const parsed = parse(maxRaw);
    if (isNaN(parsed) || parsed > absMax) onMaxChange(absMax);
    else if (parsed <= minVal) onMaxChange(minVal + step);
    else onMaxChange(parsed);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        {minLabel && <p className="text-[10px] text-muted-foreground font-medium">{minLabel}</p>}
        <Input
          value={minRaw}
          onChange={(e) => setMinRaw(e.target.value)}
          onBlur={commitMin}
          onKeyDown={(e) => e.key === "Enter" && commitMin()}
          className={cn("h-8 text-xs font-medium", errorMin && "border-destructive")}
        />
        {errorMin && (
          <p className="text-[10px] text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3 shrink-0" />{errorMin}
          </p>
        )}
      </div>
      <div className="space-y-1">
        {maxLabel && <p className="text-[10px] text-muted-foreground font-medium">{maxLabel}</p>}
        <Input
          value={maxRaw}
          onChange={(e) => setMaxRaw(e.target.value)}
          onBlur={commitMax}
          onKeyDown={(e) => e.key === "Enter" && commitMax()}
          className={cn("h-8 text-xs font-medium", errorMax && "border-destructive")}
        />
        {errorMax && (
          <p className="text-[10px] text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3 shrink-0" />{errorMax}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Live summary bar ──────────────────────────────────────────────
function ActiveSummary({ draft }: { draft: ProductFilters }) {
  const parts: string[] = [];

  if ((draft.categories?.length ?? 0) > 0)
    parts.push(draft.categories!.length === 1 ? draft.categories![0] : `${draft.categories!.length} categories`);
  if (draft.inStock === true) parts.push("In stock");
  if (draft.inStock === false) parts.push("Out of stock");
  if (draft.subsidised) parts.push("Subsidised");
  if (draft.minPrice !== undefined || draft.maxPrice !== undefined) {
    const lo = ((draft.minPrice ?? 0) / 100).toFixed(0);
    const hi = draft.maxPrice !== undefined ? `CA$${(draft.maxPrice / 100).toFixed(0)}` : `CA$${MAX_PRICE_DOLLARS}+`;
    parts.push(`CA$${lo}–${hi}`);
  }
  if ((draft.taxRates?.length ?? 0) > 0)
    parts.push(draft.taxRates!.map((r) => `${(r * 100).toFixed(0)}%`).join("+") + " tax");
  if (draft.markupMin !== undefined || draft.markupMax !== undefined)
    parts.push(`${draft.markupMin ?? 0}–${draft.markupMax ?? 100}% markup`);
  if (draft.sortBy && draft.sortBy !== "recommended") {
    const labels: Record<string, string> = { price_asc: "Price ↑", price_desc: "Price ↓", name_asc: "A→Z" };
    parts.push(labels[draft.sortBy] ?? draft.sortBy);
  }

  if (parts.length === 0) return null;

  return (
    <div className="mx-5 mb-0 mt-3 px-3.5 py-2.5 rounded-xl bg-primary/8 border border-primary/20 flex items-start gap-2.5">
      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0 animate-pulse" />
      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-widest text-primary mb-0.5">Will apply</p>
        <p className="text-xs text-foreground font-medium leading-relaxed break-words">
          {parts.join(" · ")}
        </p>
      </div>
    </div>
  );
}

// ── Price range section ───────────────────────────────────────────
function PriceRangeSection({ draft, setDraft }: { draft: ProductFilters; setDraft: (f: ProductFilters) => void }) {
  const minCents = draft.minPrice ?? 0;
  const maxCents = draft.maxPrice ?? MAX_PRICE_CENTS;
  const [errors, setErrors] = useState<{ min: string | null; max: string | null }>({ min: null, max: null });

  const setMin = useCallback((val: number) => {
    if (val < 0) { setErrors((e) => ({ ...e, min: "Must be ≥ 0" })); setDraft({ ...draft, minPrice: 0 }); }
    else if (val >= maxCents) { setErrors((e) => ({ ...e, min: "Must be less than max" })); setDraft({ ...draft, minPrice: maxCents - 100 }); }
    else { setErrors((e) => ({ ...e, min: null })); setDraft({ ...draft, minPrice: val }); }
  }, [draft, maxCents, setDraft]);

  const setMax = useCallback((val: number) => {
    if (val > MAX_PRICE_CENTS) { setErrors((e) => ({ ...e, max: `Max is CA$${MAX_PRICE_DOLLARS}` })); setDraft({ ...draft, maxPrice: MAX_PRICE_CENTS }); }
    else if (val <= minCents) { setErrors((e) => ({ ...e, max: "Must be greater than min" })); setDraft({ ...draft, maxPrice: minCents + 100 }); }
    else { setErrors((e) => ({ ...e, max: null })); setDraft({ ...draft, maxPrice: val }); }
  }, [draft, minCents, setDraft]);

  return (
    <FilterSection label="Price Range">
      <div className="space-y-3">
        <Slider
          min={0} max={MAX_PRICE_CENTS} step={100}
          value={[minCents, maxCents]}
          onValueChange={([min, max]) => { setErrors({ min: null, max: null }); setDraft({ ...draft, minPrice: min, maxPrice: max }); }}
        />
        <RangeInputs
          minVal={minCents} maxVal={maxCents} absMin={0} absMax={MAX_PRICE_CENTS} step={100}
          format={(v) => (v / 100).toFixed(2)}
          parse={(s) => Math.round(parseFloat(s.replace(/[^0-9.]/g, "")) * 100)}
          onMinChange={setMin} onMaxChange={setMax}
          minLabel="Min (CA$)" maxLabel="Max (CA$)"
          errorMin={errors.min} errorMax={errors.max}
        />
      </div>
    </FilterSection>
  );
}

// ── Markup range section ──────────────────────────────────────────
function MarkupRangeSection({ draft, setDraft }: { draft: ProductFilters; setDraft: (f: ProductFilters) => void }) {
  const markupMin = draft.markupMin ?? 0;
  const markupMax = draft.markupMax ?? 100;
  const [errors, setErrors] = useState<{ min: string | null; max: string | null }>({ min: null, max: null });

  const setMin = useCallback((val: number) => {
    if (isNaN(val) || val < 0) { setErrors((e) => ({ ...e, min: "Must be ≥ 0%" })); setDraft({ ...draft, markupMin: 0 }); }
    else if (val >= markupMax) { setErrors((e) => ({ ...e, min: "Must be less than max" })); setDraft({ ...draft, markupMin: markupMax - 5 }); }
    else { setErrors((e) => ({ ...e, min: null })); setDraft({ ...draft, markupMin: val }); }
  }, [draft, markupMax, setDraft]);

  const setMax = useCallback((val: number) => {
    if (isNaN(val) || val > 100) { setErrors((e) => ({ ...e, max: "Max is 100%" })); setDraft({ ...draft, markupMax: 100 }); }
    else if (val <= markupMin) { setErrors((e) => ({ ...e, max: "Must be greater than min" })); setDraft({ ...draft, markupMax: markupMin + 5 }); }
    else { setErrors((e) => ({ ...e, max: null })); setDraft({ ...draft, markupMax: val }); }
  }, [draft, markupMin, setDraft]);

  return (
    <FilterSection label="Markup %">
      <div className="space-y-3">
        <Slider
          min={0} max={100} step={5}
          value={[markupMin, markupMax]}
          onValueChange={([min, max]) => { setErrors({ min: null, max: null }); setDraft({ ...draft, markupMin: min, markupMax: max }); }}
        />
        <RangeInputs
          minVal={markupMin} maxVal={markupMax} absMin={0} absMax={100} step={5}
          format={(v) => `${v}`}
          parse={(s) => parseInt(s.replace(/[^0-9]/g, ""), 10)}
          onMinChange={setMin} onMaxChange={setMax}
          minLabel="Min %" maxLabel="Max %"
          errorMin={errors.min} errorMax={errors.max}
        />
      </div>
    </FilterSection>
  );
}

// ── Filter body ───────────────────────────────────────────────────
function FilterBody({
  draft,
  setDraft,
  showAdminFilters,
  isDesktop,
}: {
  draft: ProductFilters;
  setDraft: (f: ProductFilters) => void;
  showAdminFilters: boolean;
  isDesktop: boolean;
}) {
  const toggleCategory = (cat: ProductCategory) => {
    const current = draft.categories ?? [];
    setDraft({ ...draft, categories: current.includes(cat) ? current.filter((c) => c !== cat) : [...current, cat] });
  };

  const toggleTax = (rate: TaxRate) => {
    const current = draft.taxRates ?? [];
    setDraft({ ...draft, taxRates: current.includes(rate) ? current.filter((r) => r !== rate) : [...current, rate] });
  };

  return (
    <div className="space-y-6">

      {/* CATEGORY — 2 cols on desktop, 1 col phone, 2 col tablet */}
      <FilterSection label="Category">
        <div className={cn(
          "grid gap-1.5",
          isDesktop ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"
        )}>
          {CATEGORIES.map(({ label, emoji }) => (
            <Pill
              key={label}
              active={(draft.categories ?? []).includes(label)}
              onClick={() => toggleCategory(label)}
            >
              <span className="text-base leading-none shrink-0">{emoji}</span>
              <span className="text-sm">{label}</span>
            </Pill>
          ))}
        </div>
      </FilterSection>

      <Separator />

      {/* AVAILABILITY — pill per option in a row, wraps cleanly */}
      <FilterSection label="Availability">
        <div className="flex flex-wrap gap-2">
          {[
            { label: "In stock", emoji: "✅", active: draft.inStock === true, onClick: () => setDraft({ ...draft, inStock: draft.inStock === true ? undefined : true }) },
            { label: "Out of stock", emoji: "🚫", active: draft.inStock === false, onClick: () => setDraft({ ...draft, inStock: draft.inStock === false ? undefined : false }) },
            { label: "Subsidised", emoji: "⭐", active: draft.subsidised === true, onClick: () => setDraft({ ...draft, subsidised: draft.subsidised === true ? undefined : true }) },
          ].map(({ label, emoji, active, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all whitespace-nowrap",
                active
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background text-foreground border-border hover:border-primary/50 hover:bg-primary/5",
              )}
            >
              <span className="text-base leading-none">{emoji}</span>
              {label}
              {active && <Check className="h-3.5 w-3.5 shrink-0 ml-0.5" />}
            </button>
          ))}
        </div>
      </FilterSection>

      <Separator />

      {/* PRICE RANGE */}
      <PriceRangeSection draft={draft} setDraft={setDraft} />

      {showAdminFilters && (
        <>
          <Separator />

          {/* TAX TYPE */}
          <FilterSection label="Tax Type">
            <div className={cn("grid gap-1.5", isDesktop ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2")}>
              {TAX_OPTIONS.map(({ label, value }) => (
                <Pill
                  key={label}
                  active={(draft.taxRates ?? []).includes(value)}
                  onClick={() => toggleTax(value)}
                >
                  <span className="text-sm">{label}</span>
                </Pill>
              ))}
            </div>
          </FilterSection>

          <Separator />

          {/* MARKUP */}
          <MarkupRangeSection draft={draft} setDraft={setDraft} />
        </>
      )}

      <Separator />

      {/* SORT BY */}
      <FilterSection label="Sort By">
        <div className={cn("grid gap-1.5", isDesktop ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2")}>
          {SORT_OPTIONS.map(({ label, value }) => (
            <Pill
              key={label}
              active={(draft.sortBy ?? "recommended") === value}
              onClick={() => setDraft({ ...draft, sortBy: value })}
            >
              <span className="text-sm">{label}</span>
            </Pill>
          ))}
        </div>
      </FilterSection>

      {/* bottom padding so last item isn't hidden behind footer */}
      <div className="h-2" />
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────
export interface ProductFiltersProps {
  filters: ProductFilters;
  onApply: (filters: ProductFilters) => void;
  role?: "admin" | "store" | "customer";
}

export function ProductFiltersSheet({ filters, onApply, role = "store" }: ProductFiltersProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ProductFilters>(filters);
  const isDesktop = useIsDesktop();

  useEffect(() => { setDraft(filters); }, [filters]);

  const showAdminFilters = role === "admin" || role === "store";

  const activeCount = [
    (draft.categories?.length ?? 0) > 0,
    draft.minPrice !== undefined || draft.maxPrice !== undefined,
    draft.subsidised !== undefined,
    draft.inStock !== undefined,
    (draft.taxRates?.length ?? 0) > 0,
    draft.markupMin !== undefined || draft.markupMax !== undefined,
    draft.sortBy && draft.sortBy !== "recommended",
  ].filter(Boolean).length;

  const handleApply = () => {
    const cleaned: ProductFilters = { ...draft };
    if (cleaned.minPrice === 0) delete cleaned.minPrice;
    if (cleaned.maxPrice === MAX_PRICE_CENTS) delete cleaned.maxPrice;
    if (cleaned.markupMin === 0) delete cleaned.markupMin;
    if (cleaned.markupMax === 100) delete cleaned.markupMax;
    if (cleaned.sortBy === "recommended") delete cleaned.sortBy;
    onApply(cleaned);
    setOpen(false);
  };

  const handleReset = () => { setDraft({}); onApply({}); setOpen(false); };
  const handleOpenChange = (v: boolean) => { setOpen(v); if (!v) setDraft(filters); };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn("relative shrink-0", activeCount > 0 && "border-primary text-primary")}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        side={isDesktop ? "right" : "bottom"}
        className={cn(
          "flex flex-col p-0 gap-0 overflow-hidden",
          isDesktop ? "w-[480px] h-full" : "h-[92dvh] rounded-t-2xl md:h-[88dvh]",
        )}
      >
        {/* ── Header ── */}
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-border shrink-0">
          {/* Top row: title + close button (shadcn puts the X here automatically) */}
          <div className="flex items-center justify-between gap-3 pr-6">
            {/* pr-6 leaves room for shadcn's built-in X button */}
            <SheetTitle className="flex items-center gap-2 text-base font-bold">
              <SlidersHorizontal className="h-4 w-4 text-primary shrink-0" />
              Filters
              {activeCount > 0 && (
                <Badge variant="secondary" className="text-xs font-semibold">
                  {activeCount}
                </Badge>
              )}
            </SheetTitle>

            {activeCount > 0 && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors shrink-0"
              >
                <RotateCcw className="h-3 w-3" />
                Clear all
              </button>
            )}
          </div>
        </SheetHeader>

        {/* ── Live summary (below header, above scroll body) ── */}
        <ActiveSummary draft={draft} />

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 no-scrollbar">
          <FilterBody
            draft={draft}
            setDraft={setDraft}
            showAdminFilters={showAdminFilters}
            isDesktop={isDesktop}
          />
        </div>

        {/* ── Footer ── */}
        <SheetFooter className="px-5 pt-3 pb-8 lg:pb-5 border-t border-border shrink-0">
          <div className="flex gap-2 w-full">
            {activeCount > 0 && (
              <Button
                variant="outline"
                onClick={handleReset}
                className="shrink-0 rounded-xl gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            )}
            <Button onClick={handleApply} className="flex-1 rounded-xl font-semibold">
              Apply Filters
              {activeCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 bg-primary-foreground/20 text-primary-foreground border-0 text-xs"
                >
                  {activeCount}
                </Badge>
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}