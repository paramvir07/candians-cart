"use client";

import { Info, MapPin, Store, Users } from "lucide-react";
import { Button } from "../../ui/button";
import { useSetAtom } from "jotai";
import {
  isStoreSelectedDialogOpenAtom,
  storeIdAtom,
  storeNameAtom,
} from "@/atoms/customer/signUp";
import { StoreDocument } from "@/types/store/store";
import { StoreInfoDialog } from "./StoreInfoDialog";
import { useState } from "react";

const SelectStore = ({ stores }: { stores: StoreDocument[] }) => {
  const [selectedStoreInfo, setSelectedStoreInfo] =
    useState<StoreDocument | null>(null);
  const [hoveredStore, setHoveredStore] = useState<string | null>(null);

  const setStore = useSetAtom(storeNameAtom);
  const setStoreId = useSetAtom(storeIdAtom);
  const setIsStoreSelectedDialogOpen = useSetAtom(
    isStoreSelectedDialogOpenAtom,
  );

  const handleStoreSelect = (storeName: string, storeId: string) => {
    setStore(storeName);
    setStoreId(storeId);
    setIsStoreSelectedDialogOpen(true);
  };

  return (
    <div className="w-80 space-y-4">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-2">
          <Store className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold">Choose Your Store</h2>
        <p className="text-muted-foreground text-sm">
          Select the nearest grocery store to get started.
        </p>
      </div>

      {/* Store list */}
      <div className="w-full space-y-2.5">
        {stores.map((s, i) => {
          const isHovered = hoveredStore === s.name;
          return (
            <div
              key={s.name}
              onMouseEnter={() => setHoveredStore(s.name)}
              onMouseLeave={() => setHoveredStore(null)}
              className="group relative rounded-xl border border-border/60 bg-card hover:border-primary/50 hover:shadow-md hover:shadow-primary/8 transition-all duration-200 overflow-hidden"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Left accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-0.75 bg-primary/0 group-hover:bg-primary/60 transition-all duration-200 rounded-l-xl" />

              <div className="flex items-center gap-3 p-3.5 pl-5">
                {/* Avatar */}
                <div
                  className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                    isHovered
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {s.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{s.name}</h3>
                  <div className="flex items-center gap-1 text-muted-foreground text-xs mt-0.5">
                    <Users className="h-3 w-3 shrink-0" />
                    <span>
                      {s.members.length} member
                      {s.members.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Actions — stacked vertically like the original */}
                <div className="flex flex-col items-stretch gap-1.5 w-24 shrink-0">
                  <Button
                    size="sm"
                    className="h-7 text-xs font-semibold shadow-sm shadow-primary/20 hover:shadow-primary/30 transition-shadow"
                    onClick={() => handleStoreSelect(s.name, s._id)}
                  >
                    Select
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStoreInfo(s);
                    }}
                  >
                    <Info className="h-3 w-3 mr-1" /> Info
                  </Button>
                </div>
              </div>
            </div>
          );
        })}

        {stores.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No stores available in your area yet.</p>
          </div>
        )}
      </div>

      <StoreInfoDialog
        store={selectedStoreInfo}
        isOpen={!!selectedStoreInfo}
        onClose={() => setSelectedStoreInfo(null)}
      />
    </div>
  );
};

export default SelectStore;
