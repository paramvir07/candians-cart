import StoreSidebar from "@/components/store/StoreSidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";

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
    if (role === "admin") {
      redirect(`/admin`);
    } else if (role === "customer") {
      redirect(`/`);
    } else if (role === "cashier") {
      redirect(`/cashier`);
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
