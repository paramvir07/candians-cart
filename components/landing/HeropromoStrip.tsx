import { Suspense } from "react";
import { PromotionBannerSkeleton } from "@/components/skeletons/PromotionBannerSkeleton";
import { DrawPromoCardSkeleton } from "../skeletons/DrawpromoSkeleton";
import { DrawPromoCardLoader } from "../promotions/DrawpromocardLoader";
import { PromotionBannerLoader } from "../promotions/PromotionbannerLoader";

export function HeroPromoStrip() {
  return (
    <div className="flex flex-col gap-3">
      <Suspense fallback={<DrawPromoCardSkeleton />}>
        <DrawPromoCardLoader />
      </Suspense>
      <Suspense fallback={<PromotionBannerSkeleton />}>
        <PromotionBannerLoader />
      </Suspense>
    </div>
  );
}