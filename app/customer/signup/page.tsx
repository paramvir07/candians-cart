import { getStores } from "@/actions/store/getStores.actions";
import SignupClient from "@/components/customer/signup/SignUpClient";
import { auth } from "@/lib/auth/auth";
import { StoreDocument } from "@/types/store/store";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) redirect("/customer");

  const storesResponse = await getStores();

  if (!storesResponse.success) {
    return <div>{storesResponse.error}</div>;
  }

  const stores: StoreDocument[] = storesResponse.data;

  return <SignupClient stores={stores} />;
}