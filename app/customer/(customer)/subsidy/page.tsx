import { getSubsidizedProducts } from "@/actions/customer/ProductAndStore/Cart.Action";
import Navbar from "@/components/customer/landing/Navbar"
import { ProductsSection } from "@/components/customer/products/ProductsSection";

const page = async() => {
  const products = await getSubsidizedProducts();
  console.log(products)
  return (
    <div>
      <Navbar/>
      <ProductsSection products={products}/>
    </div>
  )
}

export default page