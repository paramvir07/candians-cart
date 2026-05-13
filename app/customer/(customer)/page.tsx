import { Metadata } from "next";
import { Suspense } from "react";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import getStoreAndProduct from "@/actions/customer/ProductAndStore/getAssociatedStore";
import Navbar from "@/components/customer/landing/Navbar";
import CustomerAdvertisements from "@/components/customer/shared/CustomerAdvertisements";
import { HeroBannerLoader } from "@/components/customer/landing/HeroBannerLoader";
import { ProductsSectionLoader } from "@/components/customer/products/ProductsSectionLoader";
import { redirect } from "next/navigation";
import { HeroBannerSkeleton } from "@/components/skeletons/HeroBannerSkeleton";
import { ProductsSkeleton } from "@/components/skeletons/ProductsSkeleton";

export const metadata: Metadata = {
  title: "Home | Candian's Cart",
  description: "Browse our fresh selection of groceries, exclusive subsidized items, and everyday essentials.",
};

export default async function CustomerPage() {
  const session = await getUserSession();
  const role = session.user.role;

  if (role !== "customer") {
    if (role === "store" || role === "admin" || role === "cashier")
      redirect(`/${role}`);
    else redirect("/customer/login");
  }

  const storeResponse = await getStoreAndProduct();

  if (!storeResponse.success || !storeResponse.customer?.associatedStoreId) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 max-w-md shadow-sm">
            <h3 className="font-bold text-lg mb-2">Unable to Load Store</h3>
            <p className="text-sm text-red-500">
              {storeResponse.error || "Please verify your account matches a registered Candian's Cart store."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const storeId = storeResponse.customer.associatedStoreId.toString();

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <Navbar />

      {/* HeroBanner streams in while store doc loads */}
      <Suspense fallback={<HeroBannerSkeleton />}>
        <HeroBannerLoader storeId={storeId} />
      </Suspense>

      <CustomerAdvertisements maxHeight={250} />

      {/* Products stream in independently */}
      <Suspense fallback={<ProductsSkeleton />}>
        <ProductsSectionLoader storeId={storeId} />
      </Suspense>
    </div>
  );
}