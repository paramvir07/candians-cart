"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { burstStoreProductsCache } from "@/actions/admin/products/revalidateCacheForStore";
import { RefreshCw } from "lucide-react";

interface BurstCacheButtonProps {
  storeId: string;
}

export function BurstCacheButton({ storeId }: BurstCacheButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleBurstCache = () => {
    // Vercel Best Practice: Next.js auto-refreshes the RSC payload when
    // a Server Action triggers a revalidation. No router.refresh() needed.
    startTransition(async () => {
      try {
        const result = await burstStoreProductsCache(storeId);

        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.error("Failed to execute cache burst action", error);
        toast.error("A critical error occurred. Please try again.");
      }
    });
  };

  return (
    <Button
      variant="outline"
      onClick={handleBurstCache}
      disabled={isPending}
      aria-label="Burst store cache"
    >
      <RefreshCw
        className={`mr-2 h-4 w-4 ${isPending ? "animate-spin" : ""}`}
      />
      {isPending ? "Rebuilding Cache..." : "Burst Cache"}
    </Button>
  );
}
