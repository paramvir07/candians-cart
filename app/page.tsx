import { Metadata } from "next";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import getStoreAndProduct from "@/actions/customer/ProductAndStore/getAssociatedStore";
import Navbar from "@/components/customer/landing/Navbar";
import { HeroBanner } from "@/components/customer/landing/HeroBanner";
import { ProductsSection } from "@/components/customer/products/ProductsSection";
import { redirect } from "next/navigation";
import { IProduct } from "@/types/store/products.types";
import { Footer } from "@/components/customer/landing/Footer";
import CustomerAdvertisements from "@/components/customer/shared/CustomerAdvertisements";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Browse our fresh selection of groceries, exclusive subsidized items, and everyday essentials.",
};

export default async function CustomerPage() {
  const session = await getUserSession();
  const role = session.user.role;

  if (role !== "customer") {
    if (role === "store" || role === "admin" || role === "cashier")
      redirect(`/${role}`);
    else redirect("/customer/login");
  }

  const response = await getStoreAndProduct();

  if (!response.success) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 max-w-md shadow-sm">
            <h3 className="font-bold text-lg mb-2">Unable to Load Store</h3>
            <p className="text-sm text-red-500">
              {response.error ||
                "Please verify your account matches a registered store."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const products: IProduct[] = response.products
    ? JSON.parse(JSON.stringify(response.products))
    : [];

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <Navbar />
<<<<<<< HEAD
      <main>
        {/* Server component — static, no JS needed */}
        <HeroBanner />
        {/* Client component — receives all products, handles filters/pagination */}
        <ProductsSection products={products} />
      </main>
      <Footer />
=======
      {/* Server component — static, no JS needed */}
      <HeroBanner />
      <CustomerAdvertisements />
      {/* Client component — receives all products, handles filters/pagination */}
      <ProductsSection products={products} />
      <Footer/>
>>>>>>> 7b14c8e (updates on ui)
    </div>
  );
}
