import { getProductById } from "@/actions/cashier/PriceDrop";
import PriceDropForm from "@/components/cashier/PriceDropForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PriceDropPageProps {
  params: Promise<{ productId: string }>;
}

const PriceDropPage = async ({ params }: PriceDropPageProps) => {
  const { productId } = await params;
  const result = await getProductById(productId);

  if (!result.data) return <div>Product not found</div>;
  if (result.data.PriceDrop)
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      
      <div className="mb-6 rounded-full bg-muted p-5">
        <span className="text-3xl">⚠️</span>
      </div>

      <h1 className="text-2xl font-bold text-foreground">
        Price Drop Already Applied
      </h1>

      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        This product already has an active price drop and cannot be modified again.
      </p>

      <Link
        href="/cashier"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md transition hover:opacity-90"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Cashier
      </Link>
    </div>
  );

  return <PriceDropForm product={result.data} />;
};

export default PriceDropPage;