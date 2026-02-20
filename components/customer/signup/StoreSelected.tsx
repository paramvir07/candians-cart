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

const StoreSelected = () => {
  const [store] = useAtom(storeNameAtom);
  const setStep = useSetAtom(stepAtom);
  const [isStoreSelectedDialogOpen, setIsStoreSelectedDialogOpen] = useAtom(
    isStoreSelectedDialogOpenAtom,
  );
  return (
    <>
      <AlertDialog
        open={isStoreSelectedDialogOpen}
        onOpenChange={setIsStoreSelectedDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Store Selected!</AlertDialogTitle>
            <AlertDialogDescription>
              Great! "{store}" is now set as your permanent store. You can now
              start visiting the store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setIsStoreSelectedDialogOpen(false);
                setStep("code");
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default StoreSelected;
