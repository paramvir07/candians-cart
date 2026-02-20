import { getUserSession } from "@/actions/auth/getUserSession.actions";
import getStoreAndProduct from "@/actions/customer/ProductAndStore/getAssociatedStore";
import Banner from "@/components/customer/landing/Banner";
import Navbar from "@/components/customer/landing/Navbar";
import ProductGrid from "@/components/customer/products/ProductGrid";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getUserSession();
  const role = session.user.role;

  if (role !== "customer") {
    if (role === "store" || role === "admin") {
      redirect(`/${role}`);
    } else {
      redirect("/customer/login");
    }
  }
  
  const response = await getStoreAndProduct();

  // Handle the error state from your Server Action
  if (!response.success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 max-w-md">
            <h3 className="font-bold text-lg mb-1">Unable to Load Store</h3>
            <p>
              {response.message ||
                "Please verify your account matches a registered store."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If success, we have products
  const products = response.products
    ? JSON.parse(JSON.stringify(response.products))
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="p-4 hidden md:block">
        <Banner />
      </div>

      <main className="container mx-auto px-4 pb-20">
        <ProductGrid products={products} />
      </main>
    </div>
  );
}
