import StoreSidebar from "@/components/store/StoreSidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import CustomerAdvertisements from "@/components/customer/shared/CustomerAdvertisements";
import StoreFooter from "@/components/store/StoreFooter";

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
    <div className="min-h-screen flex flex-col bg-gray-50 scroll-smooth">
      <TooltipProvider>
        <div className="flex flex-1 items-start min-h-screen bg-gray-50">
          <StoreSidebar name={name} />
          <main className="flex-1 min-w-0 pt-14 md:pt-0 min-h-screen p-4">
            <CustomerAdvertisements maxHeight={250} />
            {children}
          </main>
        </div>
      </TooltipProvider>
      <StoreFooter />
    </div>
  );
}
