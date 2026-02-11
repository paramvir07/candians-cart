import { TooltipProvider } from "@/components/ui/tooltip";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {Toaster} from "@/components/ui/sonner";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) redirect("/store/login");

  const role = session.user.role;
  if (role !== "store") {
    if (role === "customer" || role === "admin") {
      redirect(`/${role}`);
    } else {
      redirect("/store/login");
    }
  }
  return (
    <div className="bg-[#F3F1ED]">
      <TooltipProvider>
        {children}
        <Toaster richColors position="top-right" />
      </TooltipProvider>
    </div>
  );
}

