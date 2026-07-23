import { Suspense } from "react";
import { PromoCarouselSkeleton } from "@/components/skeletons/PromoCarouselSkeleton";
import { PromoCardsCarouselLoader } from "@/components/promotions/PromoCardsCarouselLoader";

export function HeroPromoStrip() {
  return (
    <div className="flex flex-col gap-3">
      <Suspense fallback={<PromoCarouselSkeleton />}>
        <PromoCardsCarouselLoader />
      </Suspense>
    </div>
  );
}
