// app/customer/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/customer/landing/Navbar";
import CustomerAdvertisements from "@/components/customer/shared/CustomerAdvertisements";
import { HeroBannerSkeleton } from "@/components/skeletons/HeroBannerSkeleton";
import { ProductsSkeleton } from "@/components/skeletons/ProductsSkeleton";
import { HeroBannerLoader } from "@/components/customer/landing/HeroBannerLoader";
import { ProductsSectionLoader } from "@/components/customer/products/ProductsSectionLoader";
import { PromotionBannerSkeleton } from "@/components/skeletons/PromotionBannerSkeleton";
import { DrawPromoCardSkeleton } from "@/components/skeletons/DrawpromoSkeleton";
import { DrawPromoCardLoader } from "@/components/promotions/DrawpromocardLoader";
import { PromotionBannerLoader } from "@/components/promotions/PromotionbannerLoader";
import { AddressCheckLoader } from "@/components/customer/shared/AddressCheckLoader";

export const metadata: Metadata = {
  description:
    "Browse our fresh selection of groceries, exclusive subsidised items, and everyday essentials.",
};

export default async function CustomerPage() {
  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <Suspense fallback={null}>
        <AddressCheckLoader />
      </Suspense>

      <Navbar />
      <Suspense fallback={<HeroBannerSkeleton />}>
        <HeroBannerLoader />
      </Suspense>
      <div className="flex flex-col gap-3 mx-auto mb-6 w-full max-w-[min(92vw,760px)] sm:mt-7 lg:mt-8">
        <Suspense fallback={<DrawPromoCardSkeleton />}>
          <DrawPromoCardLoader />
        </Suspense>
        <Suspense fallback={<PromotionBannerSkeleton />}>
          <PromotionBannerLoader />
        </Suspense>
      </div>
      <CustomerAdvertisements maxHeight={250} />
      <Suspense fallback={<ProductsSkeleton />}>
        <ProductsSectionLoader />
      </Suspense>
    </div>
  );
}
