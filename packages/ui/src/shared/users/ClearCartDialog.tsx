"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ClearCart } from "@/actions/customer/ProductAndStore/Cart.Action";

export default function ClearCartDialog({
  customerId,
}: {
  customerId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      try {
        const res = await ClearCart(customerId);
        if (!res.success) {
          toast.error(res.message ?? "Failed to clear cart");
          return;
        }
        toast.success("Cart cleared");
        setOpen(false);
      } catch (err) {
        console.error(err);
        toast.error("Server error. Please try again later.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Small unobtrusive trigger — no full-width stretch */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground/60 hover:text-destructive transition-colors"
      >
        <Trash2 className="h-3 w-3" />
        Clear cart
      </button>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle>Clear cart?</DialogTitle>
          </div>
          <DialogDescription>
            This removes all items, subsidy items, and misc items from this
            customer&apos;s cart. This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-2 mt-1">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              className="hover:bg-muted hover:text-foreground hover:border-border"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? "Clearing…" : "Clear cart"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}