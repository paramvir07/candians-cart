"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronRight, MapPin } from "lucide-react";
import { useSetAtom } from "jotai";
import { stepAtom } from "@/atoms/customer/signUp";
import { Button } from "../../ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const CITIES = [
  { value: "abbotsford", label: "Abbotsford", province: "BC", available: true },
  { value: "vancouver",  label: "Vancouver",  province: "BC", available: false },
  { value: "surrey",     label: "Surrey",     province: "BC", available: false },
  { value: "kelowna",    label: "Kelowna",    province: "BC", available: false },
];

const Location = () => {
  const setStep = useSetAtom(stepAtom);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<typeof CITIES[number] | null>(null);

  const handleSelect = (city: typeof CITIES[number]) => {
    if (!city.available) return;
    setSelected(city);
    setOpen(false);
  };

  const handleContinue = () => {
    if (selected?.available) setStep("terms");
  };

  return (
    <div className="w-full space-y-3">

      {/* City picker */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full flex items-center justify-between gap-3",
              "h-12 px-4 rounded-xl text-sm",
              "border transition-all duration-200 cursor-pointer outline-none",
              "bg-background hover:bg-muted/30",
              open
                ? "border-primary ring-2 ring-primary/15"
                : "border-border hover:border-primary/50",
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <MapPin className={cn(
                "h-4 w-4 shrink-0 transition-colors",
                selected ? "text-primary" : "text-muted-foreground"
              )} />
              {selected ? (
                <span className="font-medium text-foreground">
                  {selected.label}, {selected.province}
                </span>
              ) : (
                <span className="text-muted-foreground">Select your city</span>
              )}
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200",
              open && "rotate-180"
            )} />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-[var(--radix-popover-trigger-width)] p-1.5 rounded-2xl border border-border shadow-xl"
        >
          <div className="space-y-0.5">
            {CITIES.map((city) => (
              <button
                key={city.value}
                type="button"
                disabled={!city.available}
                onClick={() => handleSelect(city)}
                className={cn(
                  "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150",
                  city.available
                    ? "cursor-pointer hover:bg-primary/8 hover:text-foreground"
                    : "cursor-not-allowed opacity-40",
                  selected?.value === city.value
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground",
                )}
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    selected?.value === city.value ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span>{city.label}, {city.province}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {city.available ? (
                    selected?.value === city.value ? (
                      <Check className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />
                    ) : (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-semibold">
                        Available
                      </span>
                    )
                  ) : (
                    <span className="text-[10px] text-muted-foreground/60 font-medium">
                      Coming soon
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Footer note */}
          <div className="mt-1.5 pt-1.5 px-3 pb-1 border-t border-border/60">
            <p className="text-[11px] text-muted-foreground">
              🚀 More cities launching soon
            </p>
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected city info pill */}
      {selected && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Stores available in{" "}
            <span className="font-semibold text-foreground">
              {selected.label}, {selected.province}
            </span>
          </p>
        </div>
      )}

      {/* Continue button */}
      <Button
        type="button"
        disabled={!selected}
        onClick={handleContinue}
        className="w-full h-11 rounded-full font-semibold shadow-md shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all duration-150 disabled:opacity-40"
      >
        Continue
      <ChevronRight/>
      </Button>
    </div>
  );
};

export default Location;