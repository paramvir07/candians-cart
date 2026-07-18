import { LoginForm } from "@/components/auth/login-form";
import { LoginCarousel } from "@/components/customer/login/LoginCarousel";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Login",
};

type CustomerLoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: CustomerLoginPageProps) {
  const params = await searchParams;

  /*
   * Better Auth redirects to this page with signed OAuth
   * parameters such as client_id, redirect_uri, exp and sig.
   *
   * It does not necessarily use a literal oauth_query
   * parameter in the browser URL.
   */
  const clientId =
    typeof params.client_id === "string" ? params.client_id : undefined;

  const signature = typeof params.sig === "string" ? params.sig : undefined;

  const expiresAt = typeof params.exp === "string" ? params.exp : undefined;

  const isOAuthLogin = Boolean(clientId && signature && expiresAt);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  /*
   * Normal Candian's Cart login:
   * preserve the existing redirect.
   *
   * OAuth login:
   * keep showing the page so the OAuth flow can continue.
   */
  if (session && !isOAuthLogin) {
    redirect("/customer");
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center lg:p-8 relative overflow-hidden">
      <div className="absolute inset-0 hidden lg:block bg-muted/30 z-0" />

      <div className="relative z-10 w-full lg:max-w-5xl lg:flex shadow-2xl rounded-2xl">
        <div className="hidden lg:block w-[50%] shrink-0 p-2.5">
          <div className="h-full min-h-[575px]">
            <LoginCarousel />
          </div>
        </div>

        <div className="flex-1 lg:flex lg:items-center lg:justify-center lg:px-14 lg:py-12">
          <LoginForm
            userRole="customer"
            isOAuthLogin={isOAuthLogin}
            className="w-full lg:max-w-[380px]"
          />
        </div>
      </div>
    </div>
  );
}
