import { getSubsidizedProducts } from "@/actions/customer/ProductAndStore/Cart.Action";
import Navbar from "@/components/customer/landing/Navbar";
import { ProductsSection } from "@/components/customer/products/ProductsSection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subsidized Products",
};

const page = async () => {
  const products = await getSubsidizedProducts();
  return (
    <div>
      <Navbar />
      <ProductsSection products={products} subsidized={true} />
    </div>
  );
};

export default page;
