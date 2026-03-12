"use client";

import { Info, MapPin, Users } from "lucide-react";
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
  const setStore = useSetAtom(storeNameAtom);
  const setStoreId = useSetAtom(storeIdAtom);
  const setIsStoreSelectedDialogOpen = useSetAtom(isStoreSelectedDialogOpenAtom);
  const cashierRole = userRole === "cashier";

  const handleStoreSelect = (storeName: string, storeId: string) => {
    setStore(storeName);
    setStoreId(storeId);
    setIsStoreSelectedDialogOpen(true);
  };

  return (
    <div className="w-full space-y-3">

      {stores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MapPin className="h-8 w-8 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">No stores available in your area yet.</p>
        </div>
      ) : (
        stores.map((s) => {
          const isHovered = hoveredStore === s.name;
          return (
            <div
              key={s.name}
              onMouseEnter={() => setHoveredStore(s.name)}
              onMouseLeave={() => setHoveredStore(null)}
              className="group relative rounded-xl border border-border/60 bg-card hover:border-primary/40 hover:shadow-sm transition-all duration-200 overflow-hidden"
            >
              {/* Left accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary/0 group-hover:bg-primary/70 transition-all duration-200 rounded-l-xl" />

              <div className="flex items-center gap-3 px-4 py-3.5 pl-5">
                {/* Avatar */}
                <div
                  className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                    isHovered
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {s.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground truncate">{s.name}</h3>
                  <div className="flex items-center gap-1 text-muted-foreground text-xs mt-0.5">
                    <Users className="h-3 w-3 shrink-0" />
                    <span>
                      {s.members.length} member{s.members.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStoreInfo(s);
                    }}
                  >
                    <Info className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 px-3 text-xs font-semibold rounded-lg shadow-sm shadow-primary/20"
                    onClick={() => handleStoreSelect(s.name, s._id)}
                  >
                    Select
                  </Button>
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