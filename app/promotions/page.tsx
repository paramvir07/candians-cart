import { getPromoStats } from "@/actions/promotions/getPromoStats.action";
import Footer from "@/components/landing/Footer";
import NavbarWrapper from "@/components/landing/NavbarWrapper";
import PromotionPage from "@/components/promotions/PromotionPage";

export default async function LaunchPromotionPage() {
  const stats = await getPromoStats();
  return (
    <>
      <NavbarWrapper />
      <PromotionPage initialStats={stats} />
      <Footer />
    </>
  );
}
