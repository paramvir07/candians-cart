import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StoreProductsList } from "@/components/admin/store/products/StoreProductsList";

const StoreProductsPage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;

  return (
    <div className="max-w-7xl mx-auto p-4 md:px-6 md:py-8">
      <div className="mb-8">
        <Link
          href="/admin/store"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Stores
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Store Products</h1>
        <p className="text-slate-500 mt-1">
          Manage product inventory and toggle subsidised statuses for this location.
        </p>
      </div>

      <StoreProductsList storeId={storeId} />
    </div>
  );
};

export default StoreProductsPage;