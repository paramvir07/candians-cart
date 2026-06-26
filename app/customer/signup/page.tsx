import { getStores } from "@/actions/store/getStores.actions";
import SignupClient from "@/components/customer/signup/SignUpClient";
import { auth } from "@/lib/auth/auth";
import { StoreDocument } from "@/types/store/store";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Signup",
};

type PageProps = {
  searchParams?: Promise<{
    referralCode?: string;
    heard?: string;
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) redirect("/customer");

  const params = await searchParams;

  const referralCodeParam = params?.referralCode ?? "";
  const heardParam = params?.heard ?? "";

  const storesResponse = await getStores();

  if (!storesResponse.success) {
    return <div>{storesResponse.error}</div>;
  }

  const stores: StoreDocument[] = storesResponse.data;

  return (
    <SignupClient
      stores={stores}
      referralCodeParam={referralCodeParam}
      heardParam={heardParam}
    />
  );
}
