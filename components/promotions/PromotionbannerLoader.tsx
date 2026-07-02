import { getPromoStats } from "@/actions/promotions/getPromoStats.action";
import PromotionBanner from "@/components/promotions/PromotionsBanner";

export async function PromotionBannerLoader() {
  const promoStats = await getPromoStats();
  return <PromotionBanner initialStats={promoStats} variant="card" />;
}