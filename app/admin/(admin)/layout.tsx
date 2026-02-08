import AdminSidebar from "@/components/admin/AdminSidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-[#F3F1ED] scroll-smooth ">
        <TooltipProvider>
        <AdminSidebar />
        <div className="flex-1 p-6 md:ml-18">
          {children}
        </div>
          </TooltipProvider>
    </div>
  );
}

