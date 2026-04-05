import StoreSidebar from "@/components/store/StoreSidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Store Dashboard",
    template: "%s | Store Panel - Candian's Cart",
  },
  robots: {
    index: false, // Prevents indexing of all store dashboard routes
    follow: false,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) redirect("/store/login");

  const name = session.user.name;
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
    <div className="scroll-smooth">
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50">
          <StoreSidebar name={name} />
          <main className="md:ml-64 pt-14 md:pt-0 min-h-screen m-4">
            {children}
          </main>
        </div>
      </TooltipProvider>
    </div>
  );
}
