import { LoginForm } from "@/components/auth/login-form";
import { LoginCarousel } from "@/components/customer/login/LoginCarousel";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) redirect("/cashier");
  return (
    <div className="min-h-screen w-full flex items-center justify-center lg:p-8 relative overflow-hidden ">
        {/* desktop bg */}
        <div className="absolute inset-0 hidden lg:block bg-muted/30 z-0" />
    
        <div className="relative z-10 w-full lg:max-w-5xl lg:flex shadow-2xl rounded-2xl">
          <div className="hidden lg:block w-[50%] shrink-0 p-2.5">
            <div className="h-full min-h-[575px]">
              <LoginCarousel />
            </div>
          </div>
          <div className="flex-1 lg:flex lg:items-center lg:justify-center lg:px-14 lg:py-12">
            <LoginForm userRole="cashier" className="w-full lg:max-w-[380px]" />
          </div>
        </div>
      </div>
  );
}
