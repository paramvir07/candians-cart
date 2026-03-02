"use client";
import {
  AlertDialog,
  AlertDialogAction,
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
} from "@/atoms/customer/signUp";
import { CheckCircle2 } from "lucide-react";
import { UserRole } from "@/types/auth";

const StoreSelected = ({ userRole }: { userRole?: UserRole }) => {
  const cashierRole = userRole === "cashier";
  const [store] = useAtom(storeNameAtom);
  const setStep = useSetAtom(stepAtom);
  const [isStoreSelectedDialogOpen, setIsStoreSelectedDialogOpen] = useAtom(
    isStoreSelectedDialogOpenAtom,
  );

  return (
    <AlertDialog
      open={isStoreSelectedDialogOpen}
      onOpenChange={setIsStoreSelectedDialogOpen}
    >
      <AlertDialogContent className="max-w-90 rounded-2xl p-0 overflow-hidden">
        {/* Top accent */}
        <div className="bg-linear-to-br from-primary/20 to-primary/5 px-6 pt-7 pb-5 text-center flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center">
            <CheckCircle2 className="h-7 w-7 text-primary" />
          </div>
          <AlertDialogHeader className="space-y-1 text-center">
            <AlertDialogTitle className="text-xl font-bold">
              Store Selected!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
              {cashierRole ? (
                <>
                  You are about to assign this cashier to{" "}
                  <span className="font-semibold text-foreground">{store}</span>
                  . This will grant them access to operate within this store.
                </>
              ) : (
                <>
                  <span className="font-semibold text-foreground">{store}</span>{" "}
                  is now set as your permanent store. You're one step away from
                  completing your registration.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <AlertDialogFooter className="px-6 py-4 bg-card">
          <AlertDialogAction
            className="w-full h-10 font-semibold shadow-md shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-150"
            onClick={() => {
              setIsStoreSelectedDialogOpen(false);
              !cashierRole && setStep("code");
            }}
          >
            Continue →
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default StoreSelected;
