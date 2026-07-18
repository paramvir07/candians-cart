// components/shared/BurstCacheButton.tsx
"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { BurstCacheResponse } from "@/types/cache/ProductCache";
interface BurstCacheButtonProps {
  // Pass the server action dynamically
  action: () => Promise<BurstCacheResponse>;
  label?: string;
}

export function BurstCacheButton({ action, label = "Burst Cache" }: BurstCacheButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleBurstCache = () => {
    startTransition(async () => {
      try {
        const result = await action();

        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.error("Failed to execute cache burst action", error);
        toast.error("A critical error occurred while purging the cache.");
      }
    });
  };

  return (
    <Button
      variant="outline"
      onClick={handleBurstCache}
      disabled={isPending}
      aria-label={label}
    >
      <RefreshCw
        className={`mr-2 h-4 w-4 ${isPending ? "animate-spin" : ""}`}
      />
      {isPending ? "Rebuilding..." : label}
    </Button>
  );
}