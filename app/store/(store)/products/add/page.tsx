import ProductForm from '@/components/store/products/ProductForm'
import StoreSidebar from "@/components/store/StoreSidebar";

const productsAdd = () => {
  return (
    <div className="flex min-h-screen">
      <StoreSidebar />

      <div className="flex-1 p-6">

        <ProductForm />

      </div>
    </div>
  )
}

export default productsAdd
