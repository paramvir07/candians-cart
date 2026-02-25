"use client";

import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { subsidisedProduct } from "@/actions/admin/subsidisedProducts"; // Adjust import to match your actual function name

interface ProductSubsidisedRowProps {
  product: {
    _id: string;
    name: string;
    category: string;
    price: number;
    subsidised: boolean;
  };
}

export const ProductSubsidisedRow = ({ product }: ProductSubsidisedRowProps) => {
  // Local state for optimistic UI updates
  const [isSubsidised, setIsSubsidised] = useState(product.subsidised || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setIsSubsidised(checked); // Optimistic update
    setIsLoading(true);

    try {
      // Call your existing server action
      const result = await subsidisedProduct(product._id, checked);
      
      if (result.success) {
        toast.success(`${product.name} is now ${checked ? "subsidised" : "unsubsidised"}.`);
      } else {
        // Revert UI if it fails
        setIsSubsidised(!checked);
        toast.error(result.error || "Failed to update status.");
      }
    } catch (error) {
      setIsSubsidised(!checked);
      toast.error("An unexpected error occurred: " + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div>
        <h4 className="font-semibold text-slate-900">{product.name}</h4>
        <div className="flex gap-3 text-sm text-slate-500 mt-1">
          <span className="bg-slate-100 px-2 py-0.5 rounded">{product.category}</span>
          <span>${(product.price / 100).toFixed(2)}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className={`text-sm font-medium ${isSubsidised ? "text-green-600" : "text-slate-400"}`}>
          {isSubsidised ? "Subsidised" : "Standard"}
        </span>
        <Switch
          checked={isSubsidised}
          onCheckedChange={handleToggle}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};