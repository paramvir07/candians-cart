import { getPromoStats } from "@/actions/promotions/getPromoStats.action";
import { getDrawStats } from "@/actions/promotions/getDrawStats.action";
import DrawPromoCard from "@/components/promotions/DrawPromoCard";
import PromoCarousel from "@/components/promotions/PromoCarousel";
import PromotionBanner from "./PromotionBanner";

/**
 * Drop this anywhere you previously stacked <PromotionBannerLoader /> and
 * <DrawPromoCardLoader /> one after another (profile page, home page,
 * promotions page teaser, etc). Renders both cards as a single auto-playing,
 * swipeable carousel with dot indicators instead of two separate cards.
 */
export async function PromoCardsCarouselLoader() {
  const [promoStats, drawStats] = await Promise.all([
    getPromoStats(),
    getDrawStats(),
  ]);

  return (
    <PromoCarousel intervalMs={5000}>
      <PromotionBanner initialStats={promoStats} variant="card" />
      <DrawPromoCard initialStats={drawStats} />
    </PromoCarousel>
  );
}
