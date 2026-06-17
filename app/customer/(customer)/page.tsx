// app/customer/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/customer/landing/Navbar";
import CustomerAdvertisements from "@/components/customer/shared/CustomerAdvertisements";
import { HeroBannerSkeleton } from "@/components/skeletons/HeroBannerSkeleton";
import { ProductsSkeleton } from "@/components/skeletons/ProductsSkeleton";
import { HeroBannerLoader } from "@/components/customer/landing/HeroBannerLoader";
import { ProductsSectionLoader } from "@/components/customer/products/ProductsSectionLoader";
import { getPromoStats } from "@/actions/promotions/getPromoStats.action";
import PromotionBanner from "@/components/promotions/PromotionsBanner";

export const metadata: Metadata = {
  description:
    "Browse our fresh selection of groceries, exclusive subsidized items, and everyday essentials.",
};

// ✅ No awaits here — page shell renders instantly
export default async function CustomerPage() {
  const promoStats = await getPromoStats();
  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <Navbar />

      <Suspense fallback={<HeroBannerSkeleton />}>
        <HeroBannerLoader /> {/* auth + store fetch happens inside here */}
      </Suspense>
      <div className="mx-auto mb-6 w-full max-w-[min(92vw,760px)] sm:mt-7 lg:mt-8">
        <PromotionBanner initialStats={promoStats} variant="card" />
      </div>
      <CustomerAdvertisements maxHeight={250} />

      <Suspense fallback={<ProductsSkeleton />}>
        <ProductsSectionLoader /> {/* products fetch happens inside here */}
      </Suspense>
    </div>
  );
}
