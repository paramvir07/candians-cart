import { getStores } from "@/actions/store/getStores.actions";
import { SignupForm } from "@/components/auth/signup-form";
import { StoreDocument } from "@/types/store/store";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const page = async () => {
  const storesResponse = await getStores();
  if (!storesResponse.success) {
    return <div>{storesResponse.error}</div>;
  }
  const stores: StoreDocument[] = storesResponse.data;
  return (
    <>
      <div className="lg:ml-50">
        <Link
          href={`/admin/new-user`}
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Link>
      </div>
      <div className="flex items-center justify-center p-5">
        <SignupForm userRole="cashier" stores={stores} />
      </div>
    </>
  );
};

export default page;
