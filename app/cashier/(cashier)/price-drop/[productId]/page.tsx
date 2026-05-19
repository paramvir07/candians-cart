import { getProductById } from "@/actions/cashier/PriceDrop";

interface PriceDropPageProps {
  params: Promise<{ productId: string }>;
}

const PriceDropPage = async ({ params }: PriceDropPageProps) => {
  const { productId } = await params;

  const ProductData = await getProductById(productId);
  console.log(ProductData)

  return (
    <div>
      <p>Product ID: {productId}</p>
    </div>
  );
};

export default PriceDropPage;