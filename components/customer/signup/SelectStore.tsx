"use client";

import { Info, MapPin, Users, Check, X } from "lucide-react";
import { Button } from "../../ui/button";
import { useAtom, useSetAtom } from "jotai";
import {
  isStoreSelectedDialogOpenAtom,
  storeIdAtom,
  storeNameAtom,
  storeAddressAtom,
  pendingStoreIdAtom,
  pendingStoreAddressAtom,
} from "@/atoms/customer/signUp";
import { StoreDocument } from "@/types/store/store";
import { StoreInfoDialog } from "./StoreInfoDialog";
import { useMemo, useState } from "react";
import { UserRole } from "@/types/auth";

const SelectStore = ({
  stores,
  userRole,
}: {
  stores: StoreDocument[];
  userRole?: UserRole;
}) => {
  const [selectedStoreInfo, setSelectedStoreInfo] =
    useState<StoreDocument | null>(null);
  const [hoveredStore, setHoveredStore] = useState<string | null>(null);

  const setStoreName = useSetAtom(storeNameAtom);
  const [storeId, setStoreId] = useAtom(storeIdAtom);
  const setStoreAddress = useSetAtom(storeAddressAtom);
  const setPendingStoreId = useSetAtom(pendingStoreIdAtom);
  const setPendingAddress = useSetAtom(pendingStoreAddressAtom);
  const setIsStoreSelectedDialogOpen = useSetAtom(
    isStoreSelectedDialogOpenAtom,
  );

  const sortedStores = useMemo(() => {
    return [...stores].sort((a, b) => {
      const aActive = a.isActive === true;
      const bActive = b.isActive === true;

      if (aActive === bActive) return 0;
      return aActive ? -1 : 1;
    });
  }, [stores]);

  const handleStoreSelect = (store: StoreDocument) => {
    if (store.isActive !== true) return;

    setStoreName(store.name);
    setPendingStoreId(store._id);
    setPendingAddress(store.address);
    setIsStoreSelectedDialogOpen(true);
  };

  const handleUnselect = () => {
    setStoreName("");
    setStoreId("");
    setStoreAddress("");
    setPendingStoreId("");
    setPendingAddress("");
  };

  return (
    <div className="w-full space-y-4">
      {sortedStores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MapPin className="mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No stores available in your area yet.
          </p>
        </div>
      ) : (
        sortedStores.map((s) => {
          const isSelected = storeId === s._id;
          const isHovered = hoveredStore === s.name;
          const isInactive = s.isActive !== true;

          return (
            <div
              key={s._id}
              onMouseEnter={() => setHoveredStore(s.name)}
              onMouseLeave={() => setHoveredStore(null)}
              className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 ${
                isInactive
                  ? "border-dashed border-orange-200 bg-orange-50/40"
                  : isSelected
                    ? "border-primary/60 bg-primary/5 shadow-sm"
                    : "border-border/60 bg-card hover:border-primary/40 hover:shadow-md"
              }`}
            >
              <div
                className={`absolute left-0 top-0 h-full w-1 transition-all duration-200 ${
                  isInactive
                    ? "bg-orange-300"
                    : isSelected
                      ? "bg-primary"
                      : "bg-transparent group-hover:bg-primary/70"
                }`}
              />

              <div className="flex flex-col gap-4 p-4 pl-5 sm:flex-row sm:items-center sm:gap-4 sm:px-5 sm:py-4">
                <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center sm:gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold transition-all duration-200 sm:h-12 sm:w-12 ${
                      isInactive
                        ? "bg-orange-100 text-orange-700"
                        : isSelected || isHovered
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                          : "bg-primary/10 text-primary"
                    }`}
                  >
                    {isSelected ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      s.name.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <h3
                        className={`max-w-full truncate text-base font-semibold leading-tight ${
                          isInactive ? "text-orange-950/80" : "text-foreground"
                        }`}
                      >
                        {s.name}
                      </h3>

                      {isSelected && (
                        <span className="inline-flex shrink-0 items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                          Selected
                        </span>
                      )}
                    </div>

                    <div className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {s.members.length} member
                        {s.members.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 shrink-0 rounded-full p-0 text-muted-foreground hover:text-foreground"         
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStoreInfo(s);
                    }}
                    title={
                      isInactive
                        ? "This store is coming soon"
                        : "View store information"
                    }
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex w-full justify-end sm:w-auto sm:shrink-0">
                  {isSelected ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-10 w-full rounded-full border-destructive/50 px-4 text-sm font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto"
                      onClick={handleUnselect}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Unselect
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      disabled={isInactive}
                      className={`h-10 w-full rounded-full px-5 text-sm font-semibold sm:w-auto ${
                        isInactive
                          ? "bg-orange-100 text-orange-700 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-100"
                          : "shadow-sm shadow-primary/20"
                      }`}
                      onClick={() => handleStoreSelect(s)}
                    >
                      {isInactive ? "Coming soon" : "Select"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}

      <StoreInfoDialog
        store={selectedStoreInfo}
        isOpen={!!selectedStoreInfo}
        onClose={() => setSelectedStoreInfo(null)}
      />
    </div>
  );
};

export default SelectStore;
