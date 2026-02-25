import { getStores } from "@/actions/store/getStores.actions";
import SignupClient from "@/components/customer/signup/SignUpClient";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) redirect("/");

  const result = await getStores();
      // Updated getStores function to return JSON Stringfied data
  // const data = JSON.parse(JSON.stringify(result)).data;

  if (!result.success) {
    return <div>{result.error}</div>;
  }

  return <SignupClient stores={result.data} />;
}
