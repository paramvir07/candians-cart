import { getUserSession } from "@/actions/auth/getUserSession.actions";
import { TooltipProvider } from "@/components/ui/tooltip";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import CashierSidebar from "@/components/cashier/CashierSlidebar";

export const metadata: Metadata = {
  title: {
    default: "Cashier Terminal",
    template: "%s | Terminal - Canadian's Cart",
  },
  robots: {
    index: false, // Prevents indexing of all cashier routes
    follow: false,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="scroll-smooth">
        <div className="min-h-screen bg-gray-50">
          <main>
            <CashierSidebar />
            {children}
          </main>
        </div>
    </div>
  );
}
