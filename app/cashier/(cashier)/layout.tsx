import { getUserSession } from "@/actions/auth/getUserSession.actions";
import { TooltipProvider } from "@/components/ui/tooltip";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Cashier Terminal",
    template: "%s | Terminal - Candian's Cart",
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
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50">
          <main className="md:ml-64 pt-14 md:pt-0 min-h-screen">
            {children}
          </main>
        </div>
      </TooltipProvider>
    </div>
  );
}
