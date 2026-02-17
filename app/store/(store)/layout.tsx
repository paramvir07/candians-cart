import { TooltipProvider } from "@/components/ui/tooltip";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import StoreSidebar from "@/components/store/StoreSidebar";

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
        <div className="flex min-h-screen bg-[#F3F1ED]">
          <StoreSidebar />
          <main className="flex-1 p-6">{children}</main>
        </div>
        <Toaster richColors position="top-right" />
      </TooltipProvider>
    </div>
  );
}
