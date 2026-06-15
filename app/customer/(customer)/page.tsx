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
  description: "Browse our fresh selection of groceries, exclusive subsidized items, and everyday essentials.",
};

export default function CustomerPage() {
  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <Navbar />

      <Suspense fallback={<HeroBannerSkeleton />}>
        <HeroBannerLoader /> 
      </Suspense>

      <CustomerAdvertisements maxHeight={250} />

      <Suspense fallback={<ProductsSkeleton />}>
        <ProductsSectionLoader /> 
      </Suspense>
    </div>
  );
}