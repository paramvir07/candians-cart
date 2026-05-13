import StoreSidebar from "@/components/store/StoreSidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import CustomerAdvertisements from "@/components/customer/shared/CustomerAdvertisements";

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
  return (
    <div className="scroll-smooth">
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50">
          <StoreSidebar name={name} />
          <main className="md:ml-64 pt-14 md:pt-0 min-h-screen m-4">
            <CustomerAdvertisements maxHeight={250}/>
            {children}
          </main>
        </div>
      </TooltipProvider>
    </div>
  );
}
