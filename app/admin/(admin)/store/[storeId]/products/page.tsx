import { StoreProductsList } from "@/components/admin/store/products/StoreProductsList";
import { ArrowLeft} from "lucide-react";
import Link from "next/link";

const StoreProductsPage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;

  return (
    <>
      <Link
        href={`/admin/store/${storeId}`}
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Link>
      <div className="space-y-4">
        <StoreProductsList storeId={storeId} role="admin" />
      </div>
    </>
  );
};

export default StoreProductsPage;
