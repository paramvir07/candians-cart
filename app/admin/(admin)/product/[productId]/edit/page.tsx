import ProductForm from "@/components/store/products/ProductForm";
import { getSingleProduct } from "@/actions/store/products/getSingleProduct";
import { redirect } from "next/navigation";

interface PageParams {
  params: {
    productId: string;
  };
}

export default async function EditProductPage({ params }: PageParams) {
    // have to unwrap wiht the await
  const localparams = await params;
  const productId = localparams.productId;
  const result = await getSingleProduct(productId);

  if (!result || !result.success) {
    console.log("Cannot find the productId");
    redirect("/admin/store");
  }

  return (
    <div className="container mx-auto py-10">
      <ProductForm initialData={result.data} role = "admin"/>
    </div>
  );
}
