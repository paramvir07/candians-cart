import React from "react";
import ProductForm from "@/components/store/products/ProductForm";
import { getSingleProduct } from "@/actions/store/products/getSingleProduct";
import { redirect } from "next/navigation";

interface PageProps {
  params: {
    productId: string;
  };
}

export default async function EditProductPage({ params }: PageProps) {
    // have to unwrap wiht the await
  const localparams = await params;
  const productId = localparams.productId;
  const result = await getSingleProduct(productId);

  if (!result || !result.success) {
    console.log("Cannot find the productId");
    redirect("/store/products");
  }

  return (
    <div className="container mx-auto py-10">
      <ProductForm initialData={result.data} />
    </div>
  );
}
