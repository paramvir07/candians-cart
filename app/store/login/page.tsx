import { LoginForm } from "@/components/auth/login-form";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// login user name and pass -: paramvirsingh2540@gmail.com, param@123
// actions/aut/auth.action.ts

// For store signup, got to actions/auth/storeSignup.actiond.ts

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) redirect("/store");
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm userRole="store" />
      </div>
    </div>
  );
}
