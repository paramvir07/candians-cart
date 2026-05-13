import { getUserSession } from "@/actions/auth/getUserSession.actions";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import AdminFooter from "@/components/admin/footer/Footer";

export const metadata: Metadata = {
  title: {
    default: "Admin Portal",
    template: "%s | Admin - Candian's Cart",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getUserSession();
  const name = session.user.name;

  return (
    // flex-col so the footer sits below the content row, never overlapped
    <div className="min-h-screen flex flex-col bg-gray-50 scroll-smooth">
      <TooltipProvider>
        {/*
          items-start is REQUIRED — without it the sidebar wrapper stretches
          to match <main> height and sticky stops working.
        */}
        <div className="flex flex-1 items-start">
          <AdminSidebar name={name} />
          {/*
            md:ml-64 → was the offset for the old `fixed` sidebar.
            Now sidebar is in-flow (sticky), so we just need a small gap.
            Keep pt-14 for the mobile fixed top-bar spacer.
          */}
          <main className="flex-1 min-w-0 pt-14 md:pt-0 min-h-screen p-4">
            {children}
          </main>
        </div>
      </TooltipProvider>

      {/*
        Footer is OUTSIDE the flex row above.
        This is the boundary that sticky respects — the sidebar can never
        scroll past the end of its containing block (the flex row), so it
        stops exactly here and never overlaps the footer.
      */}
      <AdminFooter />
    </div>
  );
}