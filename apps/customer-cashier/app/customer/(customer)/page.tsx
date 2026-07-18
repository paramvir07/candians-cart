// app/customer/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@canadian-cart/ui/customer/landing/Navbar";
import CustomerAdvertisements from "@canadian-cart/ui/customer/shared/CustomerAdvertisements";
import { HeroBannerSkeleton } from "@canadian-cart/ui/skeletons/HeroBannerSkeleton";
import { ProductsSkeleton } from "@canadian-cart/ui/skeletons/ProductsSkeleton";
import { HeroBannerLoader } from "@canadian-cart/ui/customer/landing/HeroBannerLoader";
import { ProductsSectionLoader } from "@canadian-cart/ui/customer/products/ProductsSectionLoader";
import { PromotionBannerSkeleton } from "@canadian-cart/ui/skeletons/PromotionBannerSkeleton";
import { DrawPromoCardSkeleton } from "@canadian-cart/ui/skeletons/DrawpromoSkeleton";
import { DrawPromoCardLoader } from "@canadian-cart/ui/promotions/DrawpromocardLoader";
import { PromotionBannerLoader } from "@canadian-cart/ui/promotions/PromotionbannerLoader";
import { AddressCheckLoader } from "@canadian-cart/ui/customer/shared/AddressCheckLoader";

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
