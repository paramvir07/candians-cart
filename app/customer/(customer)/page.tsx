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
import DrawPromoCard from "@/components/promotions/DrawPromoCard";
import { getDrawStats } from "@/actions/promotions/getDrawStats.action";
import { getCustomerAddress } from "@/actions/customer/getCustomerAddress.action";
import { AddressRequiredDialog } from "@/components/customer/shared/AddressRequiredDialog";

export const metadata: Metadata = {
  description:
    "Browse our fresh selection of groceries, exclusive subsidized items, and everyday essentials.",
};

export default async function CustomerPage() {
  const [promoStats, drawStats, address] = await Promise.all([
    getPromoStats(),
    getDrawStats(),
    getCustomerAddress(),
  ]);

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      {/* Non-closable dialog if address is missing */}
      {!address && <AddressRequiredDialog />}

      <Navbar />
      <Suspense fallback={<HeroBannerSkeleton />}>
        <HeroBannerLoader />
      </Suspense>
      <div className="flex flex-col gap-3 mx-auto mb-6 w-full max-w-[min(92vw,760px)] sm:mt-7 lg:mt-8">
        <DrawPromoCard initialStats={drawStats} />
        <PromotionBanner initialStats={promoStats} variant="card" />
      </div>
      <CustomerAdvertisements maxHeight={250} />
      <Suspense fallback={<ProductsSkeleton />}>
        <ProductsSectionLoader />
      </Suspense>
    </div>
  );
}
