"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddMiscItemModal from "./AddMiscItem";
import { createMiscProduct } from "@/actions/cashier/MiscItem";

export default function AddMiscItemModalTrigger({ customerId }: { customerId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" className="gap-1.5">
        <Plus className="h-4 w-4" />
        Add Misc
      </Button>

      <AddMiscItemModal
        open={open}
        onOpenChange={setOpen}
        onSubmit={async (data) => {
          return await createMiscProduct(data, customerId);
        }}
      />
    </>
  );
}