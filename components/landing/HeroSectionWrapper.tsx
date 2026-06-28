import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import HeroSection from "./hero-section";
import { getPromoStats } from "@/actions/promotions/getPromoStats.action";
import { getDrawStats } from "@/actions/promotions/getDrawStats.action";

export default async function HeroSectionWrapper() {
  let isLoggedIn = false;
  const promoStats = await getPromoStats();
  const drawStats = await getDrawStats();

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    isLoggedIn = !!session;
  } catch {
    isLoggedIn = false;
  }

  return <HeroSection isLoggedIn={isLoggedIn} initialPromoStats={promoStats} initialDrawStats={drawStats}/>;
}
