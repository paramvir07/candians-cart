import { Metadata } from "next";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import getStoreAndProduct from "@/actions/customer/ProductAndStore/getAssociatedStore";
import Navbar from "@/components/customer/landing/Navbar";
import { HeroBanner } from "@/components/customer/landing/HeroBanner";
import { ProductsSection } from "@/components/customer/products/ProductsSection";
import { redirect } from "next/navigation";
import CustomerAdvertisements from "@/components/customer/shared/CustomerAdvertisements";
import { getCachedStoreProducts } from "@/actions/cache/product.cache";
import Store from "@/db/models/store/store.model";
import { StoreDocument } from "@/types/store/store";

export const metadata: Metadata = {
  title: "Home | Candian Cart",
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

  // 1. Get the store context (customer profile & storeId)
  const storeResponse = await getStoreAndProduct();

  if (!storeResponse.success || !storeResponse.customer?.associatedStoreId) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 max-w-md shadow-sm">
            <h3 className="font-bold text-lg mb-2">Unable to Load Store</h3>
            <p className="text-sm text-red-500">
              {storeResponse.error || "Please verify your account matches a registered Candian Cart store."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const storeId = storeResponse.customer.associatedStoreId.toString();
  const storeDoc = await Store.findById(storeId).lean();
const store: StoreDocument = JSON.parse(JSON.stringify(storeDoc));

  // 2. Fetch ONLY Page 1 using our new highly-optimized Cache Action
  const initialProductsData = await getCachedStoreProducts(storeId, 1, 16, { 
    categories: [], 
    sortBy: "default" 
  });

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <Navbar />
      <HeroBanner store={store} />
      <CustomerAdvertisements maxHeight={250} />
      {/* 3. Pass Page 1 and the storeId to the client component */}
      <ProductsSection 
        storeId={storeId}
        initialData={initialProductsData} 
       />
      {/* <Footer/> */}
    </div>
  );
}