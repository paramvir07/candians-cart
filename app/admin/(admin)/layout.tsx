import AdminSidebar from "@/components/admin/AdminSidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) redirect("/admin/login");

    const role = session.user.role;
    if (role !== "admin") {
      if (role === "customer" || role === "store") {
        redirect(`/${role}`);
      } else {
        redirect("/admin/login");
      }
    }
  return (
    <div className="bg-[#F3F1ED] scroll-smooth ">
      <TooltipProvider>
        <AdminSidebar />
        <div className="flex-1 p-6 md:ml-18">{children}</div>
      </TooltipProvider>
    </div>
  );
}
