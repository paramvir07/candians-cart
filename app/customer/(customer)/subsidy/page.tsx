import { Metadata } from "next";
import Navbar from "@/components/customer/landing/Navbar";
import { ProductsSection } from "@/components/customer/products/ProductsSection";
import { getCachedStoreProducts } from "@/actions/cache/product.cache";
import getStoreAndProduct from "@/actions/customer/ProductAndStore/getAssociatedStore";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Subsidized Products | Candian Cart",
};

export default async function SubsidizedProductsPage() {
  const session = await getUserSession();
  
  if (session.user.role !== "customer") {
    redirect("/customer/login");
  }

  // 1. Securely get the user's associated store ID
  const storeResponse = await getStoreAndProduct();
  
  if (!storeResponse.success || !storeResponse.customer?.associatedStoreId) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 max-w-md shadow-sm">
            <h3 className="font-bold text-lg mb-2">Unable to Load Store</h3>
            <p className="text-sm text-red-500">
              Please verify your account matches a registered Candian Cart store.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const storeId = storeResponse.customer.associatedStoreId.toString();

  // 2. Fetch ONLY Page 1 of SUBSIDIZED products using our fast Cache Action
  const initialProductsData = await getCachedStoreProducts(storeId, 1, 16, { 
    categories: [], 
    sortBy: "default",
    subsidisedOnly: true // This tells the cache to only return subsidized items!
  });

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <Navbar />
      
      {/* Optional: A nice header so users know they are on the Subsidized page */}
      <div className="pt-24 pb-2 max-w-7xl mx-auto px-4 sm:px-6">
         <h1 className="text-3xl font-black text-green-700 tracking-tight">Subsidized Products</h1>
         <p className="text-slate-500 mt-2 font-medium">Exclusive items available for your wallet balance.</p>
      </div>

      {/* 3. Pass the correct new props to the SWR-powered Client Component */}
      <ProductsSection 
        storeId={storeId}
        initialData={initialProductsData} 
        subsidized={true} 
      />
    </div>
  );
}