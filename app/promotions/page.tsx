import { getPromoStats } from "@/actions/promotions/getPromoStats.action";
import { getDrawStats } from "@/actions/promotions/getDrawStats.action";
import Footer from "@/components/landing/Footer";
import NavbarWrapper from "@/components/landing/NavbarWrapper";
import PromotionPage from "@/components/promotions/PromotionPage";
import DrawPromoSection from "@/components/promotions/DrawPromoSection";
import ScrollToHash from "@/components/promotions/ScrollToHash";
import { Separator } from "@/components/ui/separator";

export default async function LaunchPromotionPage() {
  const [stats, drawStats] = await Promise.all([
    getPromoStats(),
    getDrawStats(),
  ]);

  return (
    <>
      <NavbarWrapper />
      {/* Ensures /promotions#anchor links scroll correctly even when
          navigating from another page via next/link */}
      <ScrollToHash />

      {/* ── Grocery Gift Card Promo (existing) ─────────────────────────── */}
      <PromotionPage initialStats={stats} />

      <Separator />
      {/* ── Free Grocery Draw (new) ────────────────────────────────────── */}
      <DrawPromoSection initialStats={drawStats} />

      <Footer />
    </>
  );
}
