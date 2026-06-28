import { getPromoStats } from "@/actions/promotions/getPromoStats.action";
import { getDrawStats } from "@/actions/promotions/getDrawStats.action";
import Footer from "@/components/landing/Footer";
import NavbarWrapper from "@/components/landing/NavbarWrapper";
import PromotionPage from "@/components/promotions/PromotionPage";
import DrawPromoSection from "@/components/promotions/DrawPromoSection";
import { Separator } from "@/components/ui/separator";

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
