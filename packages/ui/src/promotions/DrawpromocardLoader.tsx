import { getDrawStats } from "@canadian-cart/actions/promotions/getDrawStats.action";
import DrawPromoCard from "@canadian-cart/ui/promotions/DrawPromoCard";

export async function DrawPromoCardLoader() {
  const drawStats = await getDrawStats();
  return <DrawPromoCard initialStats={drawStats} />;
}