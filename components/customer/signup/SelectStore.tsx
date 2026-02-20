"use client";
import { Info } from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import { useSetAtom } from "jotai";
import {
  isStoreSelectedDialogOpenAtom,
  storeIdAtom,
  storeNameAtom,
} from "@/atoms/customer/signUp";
import { StoreDetails, StoreDocument } from "@/types/store/store";
import { StoreInfoDialog } from "./StoreInfoDialog";
import { useState } from "react";
import { Types } from "mongoose";

const SelectStore = ({ stores }: { stores: StoreDocument[] }) => {
  const [selectedStoreInfo, setSelectedStoreInfo] =
    useState<StoreDetails | null>(null);
  const setStore = useSetAtom(storeNameAtom);
  const setStoreId = useSetAtom(storeIdAtom);
  const setIsStoreSelectedDialogOpen = useSetAtom(
    isStoreSelectedDialogOpenAtom,
  );
  const handleStoreSelect = (storeName: string, storeId: Types.ObjectId) => {
    setStore(storeName);
    setStoreId(storeId);
    setIsStoreSelectedDialogOpen(true);
  };

  return (
    <>
      <p className="text-muted-foreground">
        Great. Now, select your nearest grocery store.
      </p>
      <div className="w-full max-w-sm space-y-4">
        {stores.map((s) => (
          <Card
            key={s.name}
            className="text-left cursor-pointer hover:border-primary transition-all"
          >
            <CardContent className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{s.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {s.members} members
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStoreInfo(s);
                  }}
                >
                  <Info className="h-4 w-4 mr-2" /> More Info
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleStoreSelect(s.name, s._id)}
                >
                  Select
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <StoreInfoDialog
        store={selectedStoreInfo}
        isOpen={!!selectedStoreInfo}
        onClose={() => setSelectedStoreInfo(null)}
      />
    </>
  );
};

export default SelectStore;
