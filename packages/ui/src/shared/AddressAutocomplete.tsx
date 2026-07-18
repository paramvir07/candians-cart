"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { Input } from "@/components/ui/input";

export interface ParsedAddress {
  formattedAddress: string;
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  lat: number | null;
  lng: number | null;
}

let mapsReady: Promise<any> | null = null;
let initialized = false;

function loadPlaces() {
  if (!initialized) {
    setOptions({
      key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      v: "weekly",
    });
    initialized = true;
  }
  if (!mapsReady) mapsReady = importLibrary("places");
  return mapsReady;
}

function parsePlace(place: any): ParsedAddress {
  const get = (type: string, short = false) =>
    place.addressComponents?.find((c: any) => c.types.includes(type))?.[
      short ? "shortText" : "longText"
    ] ?? "";

  const streetNumber = get("street_number");
  const route = get("route");

  return {
    formattedAddress: place.formattedAddress ?? "",
    streetAddress: [streetNumber, route].filter(Boolean).join(" "),
    city: get("locality") || get("postal_town") || get("sublocality"),
    province: get("administrative_area_level_1", true),
    postalCode: get("postal_code"),
    country: get("country", true),
    lat: place.location?.lat?.() ?? null,
    lng: place.location?.lng?.() ?? null,
  };
}

export function AddressAutocomplete({
  defaultValue = "",
  country = "ca",
  allowedProvince,
  onSelect,
  onClear,
  placeholder = "Start typing your address…",
  className,
  required,
}: {
  defaultValue?: string;
  country?: string;
  allowedProvince?: string;
  onSelect: (address: ParsedAddress) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const sessionTokenRef = useRef<any>(null);
  const placesLibRef = useRef<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tracks whether the current query value was confirmed via picking a suggestion.
  // Any manual typing resets this to false.
  const hasSelectedRef = useRef(!!defaultValue);

  useEffect(() => {
    setQuery(defaultValue);
    hasSelectedRef.current = !!defaultValue;
  }, [defaultValue]);

  useEffect(() => {
    loadPlaces().then((lib) => (placesLibRef.current = lib));
  }, []);

  // Close dropdown and clear unconfirmed input when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        if (!hasSelectedRef.current) {
          setQuery("");
          onClear?.();
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClear]);

  const fetchSuggestions = useCallback(
    async (input: string) => {
      if (!placesLibRef.current || input.trim().length < 3) {
        setSuggestions([]);
        setOpen(false);
        return;
      }
      try {
        if (!sessionTokenRef.current) {
          sessionTokenRef.current =
            new placesLibRef.current.AutocompleteSessionToken();
        }

        const { suggestions: results } =
          await placesLibRef.current.AutocompleteSuggestion.fetchAutocompleteSuggestions(
            {
              input,
              includedRegionCodes: country ? [country] : undefined,
              includedPrimaryTypes: ["street_address", "premise", "route"],
              sessionToken: sessionTokenRef.current,
            },
          );

        // Client-side filter to the allowed province (e.g. "BC")
        const filtered = (results ?? []).filter((s: any) => {
          if (!allowedProvince) return true;
          const text = s.placePrediction.text.text as string;
          return text
            .toLowerCase()
            .includes(`, ${allowedProvince.toLowerCase()},`);
        });

        setSuggestions(filtered);
        setOpen(filtered.length > 0);
      } catch {
        setSuggestions([]);
        setOpen(false);
      }
    },
    [country, allowedProvince],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    // Any manual typing invalidates a previous selection
    hasSelectedRef.current = false;
    onClear?.();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
  };

  const handlePick = async (suggestion: any) => {
    setOpen(false);
    setSuggestions([]);
    const place = suggestion.placePrediction.toPlace();
    await place.fetchFields({
      fields: ["formattedAddress", "addressComponents", "location"],
    });
    const parsed = parsePlace(place);
    setQuery(parsed.streetAddress || parsed.formattedAddress);
    hasSelectedRef.current = true;
    sessionTokenRef.current = null;
    onSelect(parsed);
  };

  const handleBlur = () => {
    // Delay so a mousedown on a suggestion item fires before blur clears everything
    setTimeout(() => {
      if (!hasSelectedRef.current) {
        setQuery("");
        setOpen(false);
        onClear?.();
      }
    }, 150);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        className={className}
      />
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-card shadow-lg overflow-hidden max-h-64 overflow-y-auto">
          {suggestions.map((s, i) => (
            <button
              type="button"
              key={i}
              // preventDefault stops the input blur from firing before onClick
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handlePick(s)}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary/60 transition-colors border-b border-border/30 last:border-0"
            >
              {s.placePrediction.text.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
