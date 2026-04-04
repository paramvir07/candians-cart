"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAtom, useSetAtom } from "jotai";
import {
  isStoreSelectedDialogOpenAtom,
  stepAtom,
  storeNameAtom,
  storeIdAtom,
  storeAddressAtom,
  pendingStoreIdAtom,
  pendingStoreAddressAtom,
} from "@/atoms/customer/signUp";
import { UserRole } from "@/types/auth";
import { MapPin } from "lucide-react";

const StoreSelected = ({ userRole }: { userRole?: UserRole }) => {
  const cashierRole = userRole === "cashier";
  const [store, setStoreName] = useAtom(storeNameAtom);
  const setStep = useSetAtom(stepAtom);
  const setStoreId = useSetAtom(storeIdAtom);
  const setStoreAddress = useSetAtom(storeAddressAtom);
  const [pendingStoreId, setPendingStoreId] = useAtom(pendingStoreIdAtom);
  const [pendingAddress, setPendingAddress] = useAtom(pendingStoreAddressAtom);
  const [isStoreSelectedDialogOpen, setIsStoreSelectedDialogOpen] = useAtom(
    isStoreSelectedDialogOpenAtom,
  );

  const handleConfirm = () => {
    // Promote pending → confirmed
    setStoreId(pendingStoreId);
    setStoreAddress(pendingAddress);
    setPendingStoreId("");
    setPendingAddress("");
    setIsStoreSelectedDialogOpen(false);
    if (!cashierRole) setStep("code");
  };

  const handleCancel = () => {
    // Discard pending, leave confirmed state untouched
    setStoreName("");
    setPendingStoreId("");
    setPendingAddress("");
    setIsStoreSelectedDialogOpen(false);
  };

  return (
    <AlertDialog
      open={isStoreSelectedDialogOpen}
      onOpenChange={(open) => {
        if (!open) handleCancel();
      }}
    >
      <AlertDialogContent className="
        w-[calc(100%-1.5rem)] max-w-[340px]
        rounded-[1.25rem] border border-border/60
        bg-card p-0 shadow-2xl shadow-black/10
        overflow-hidden gap-0
      ">
        <AlertDialogHeader className="px-5 pt-5 pb-4 space-y-3">
          <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-primary/8 border border-primary/15 px-2.5 py-1">
            <MapPin className="h-3 w-3 text-primary" />
            <span className="text-[11px] font-semibold text-primary tracking-wide truncate max-w-[200px]">
              {store}
            </span>
          </div>

          <div className="space-y-1">
            <AlertDialogTitle className="text-[15px] font-bold text-foreground leading-snug">
              {cashierRole ? "Assign cashier to this store?" : "Set as your primary store?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-muted-foreground leading-relaxed">
              {cashierRole
                ? "They'll get immediate access to store operations once assigned."
                : "You won't be able to change this later. Make sure it's the right one."}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        <div className="h-px bg-border/60" />

        <AlertDialogFooter className="flex flex-row gap-2.5 p-4">
          <AlertDialogCancel
            onClick={handleCancel}
            className="
              flex-1 h-10 rounded-xl
              border border-border bg-background
              hover:bg-muted
              text-[13px] font-semibold text-foreground
              transition-colors shadow-none m-0
            "
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="
              flex-1 h-10 rounded-xl
              bg-primary hover:bg-primary/90
              text-[13px] font-semibold text-primary-foreground
              transition-all shadow-md shadow-primary/25
              active:scale-[0.97]
            "
          >
            {cashierRole ? "Assign" : "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default StoreSelected;