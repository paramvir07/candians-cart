import ProductForm from "@/components/store/products/ProductForm";
interface PageParams {
  params: {
    storeId: string;
  };
}
const page = async ({ params }: PageParams) => {
  const localparams = await params;
  const storeId = localparams.storeId;
  return (
    <div>
      <ProductForm initialData={null} storeId={ storeId } role="admin" />
    </div>
  );
};

export default page;