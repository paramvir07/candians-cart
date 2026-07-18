import { getPromoStats } from "@canadian-cart/actions/promotions/getPromoStats.action";
import { getDrawStats } from "@canadian-cart/actions/promotions/getDrawStats.action";
import Footer from "@canadian-cart/ui/landing/Footer";
import NavbarWrapper from "@canadian-cart/ui/landing/NavbarWrapper";
import PromotionPage from "@canadian-cart/ui/promotions/PromotionPage";
import DrawPromoSection from "@canadian-cart/ui/promotions/DrawPromoSection";
import { Separator } from "@canadian-cart/ui/ui/separator";

export default async function LaunchPromotionPage() {
  const [stats, drawStats] = await Promise.all([
    getPromoStats(),
    getDrawStats(),
  ]);

  return (
    <>
      <NavbarWrapper />
      {/* ── Free Grocery Draw (new) ────────────────────────────────────── */}
      <DrawPromoSection initialStats={drawStats} />

      <Separator />

      {/* ── Grocery Gift Card Promo (existing) ─────────────────────────── */}
      <PromotionPage initialStats={stats} />

      <Footer />
    </>
  );
}
