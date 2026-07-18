import { getDrawStats } from "@/actions/promotions/getDrawStats.action";
import DrawPromoCard from "@/components/promotions/DrawPromoCard";

export async function DrawPromoCardLoader() {
  const drawStats = await getDrawStats();
  return <DrawPromoCard initialStats={drawStats} />;
}