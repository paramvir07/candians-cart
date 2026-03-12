import { getStores } from "@/actions/store/getStores.actions";
import SignupClient from "@/components/customer/signup/SignUpClient";
import { SignupCarousel } from "@/components/customer/signup/SignupCarousel";
import { auth } from "@/lib/auth/auth";
import { StoreDocument } from "@/types/store/store";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) redirect("/");

  const storesResponse = await getStores();

  if (!storesResponse.success) {
    return <div>{storesResponse.error}</div>;
  }

  const stores: StoreDocument[] = storesResponse.data;

  return (
    <div className="min-h-screen w-full flex items-center justify-center lg:p-8 relative overflow-hidden">
      {/* Desktop bg */}
      <div className="absolute inset-0 hidden lg:block bg-muted/30 z-0" />

      <div className="relative z-10 w-full lg:max-w-5xl lg:flex shadow-2xl rounded-2xl">
        {/* Carousel — desktop only */}
        <div className="hidden lg:block w-[45%] shrink-0 p-2.5">
          <div className="h-full min-h-[600px]">
            <SignupCarousel />
          </div>
        </div>

        {/* Signup steps */}
        <div className="flex-1 lg:overflow-y-auto">
          <SignupClient stores={stores} />
        </div>
      </div>
    </div>
  );
}