import ProductForm from "@/components/store/products/ProductForm";
import { getSingleProduct } from "@/actions/store/products/getSingleProduct";
import { redirect } from "next/navigation";

interface PageParams {
  params: Promise<{
    productId: string;
  }>;
}

export default async function EditProductPage({ params }: PageParams) {
  const { productId } = await params;
  const result = await getSingleProduct(productId);

  if (!result || !result.success || !result.data) {
    console.error(`Cannot find the product with ID: ${productId}`);
    // Redirecting to products list if product not found
    redirect("/store/products"); 
  }

  return (
    <div className="container mx-auto py-10">
      <ProductForm initialData={result.data} role="store" />
    </div>
  );
}