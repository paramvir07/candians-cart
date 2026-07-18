import { getPromoStats } from "@canadian-cart/actions/promotions/getPromoStats.action";
import PromotionBanner from "@canadian-cart/ui/promotions/PromotionsBanner";

export async function PromotionBannerLoader() {
  const promoStats = await getPromoStats();
  return <PromotionBanner initialStats={promoStats} variant="card" />;
}