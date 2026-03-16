import { getStores } from "@/actions/store/getStores.actions";
import { SignupForm } from "@/components/auth/signup-form";
import { StoreDocument } from "@/types/store/store";

const page = async () => {
  const storesResponse = await getStores();
  if (!storesResponse.success) {
    return <div>{storesResponse.error}</div>;
  }
  const stores: StoreDocument[] = storesResponse.data;
  return (

    <div className="flex items-center justify-center p-5">
      <SignupForm userRole="cashier" stores={stores} />
    </div>

  )
};

export default page;
