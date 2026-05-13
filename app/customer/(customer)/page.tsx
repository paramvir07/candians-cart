// app/customer/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/customer/landing/Navbar";
import CustomerAdvertisements from "@/components/customer/shared/CustomerAdvertisements";
import { HeroBannerSkeleton } from "@/components/skeletons/HeroBannerSkeleton";
import { ProductsSkeleton } from "@/components/skeletons/ProductsSkeleton";
import { HeroBannerLoader } from "@/components/customer/landing/HeroBannerLoader";
import { ProductsSectionLoader } from "@/components/customer/products/ProductsSectionLoader";

export const metadata: Metadata = {
  title: "Home | Candian's Cart",
  description: "Browse our fresh selection of groceries, exclusive subsidized items, and everyday essentials.",
};

// ✅ No awaits here — page shell renders instantly
export default function CustomerPage() {
  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <Navbar />

      <Suspense fallback={<HeroBannerSkeleton />}>
        <HeroBannerLoader />  {/* auth + store fetch happens inside here */}
      </Suspense>

      <CustomerAdvertisements maxHeight={250} />

      <Suspense fallback={<ProductsSkeleton />}>
        <ProductsSectionLoader />  {/* products fetch happens inside here */}
      </Suspense>
    </div>
  );
}