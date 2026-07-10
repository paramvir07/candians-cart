
import { VerifyPhoneClient } from "@/components/auth/VerifyPhoneClient";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function VerifyPhonePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/customer/login");
  }

  if (session.user.phoneNumberVerified) {
    redirect("/customer");
  }

  return <VerifyPhoneClient userName={session.user.name} />;
}
