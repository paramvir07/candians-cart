
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getUserSession();
  const role = session.user.role;

  if (role !== "cashier") {
    if (role === "store") {
      redirect(`/store`);
    } else if (role === "customer") {
      redirect(`/`);
    } else if (role === "admin") {
      redirect(`/admin`);
    } else {
      redirect("/cashier/login");
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
