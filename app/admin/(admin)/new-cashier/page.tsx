import { getStores } from "@/actions/store/getStores.actions";
import { SignupForm } from "@/components/auth/signup-form";
import { StoreDocument } from "@/types/store/store";

const page = async () => {
  const storesResponse = await getStores();
  if (!storesResponse.success) {
    return <div>{storesResponse.error}</div>;
  }
  const stores: StoreDocument[] = storesResponse.data;
  return <SignupForm userRole="cashier" stores={stores} />;
};

export default page;
