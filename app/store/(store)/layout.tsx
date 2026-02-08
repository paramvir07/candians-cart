import { TooltipProvider } from "@/components/ui/tooltip";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-[#F3F1ED]">
        <TooltipProvider>{children}</TooltipProvider>
    </div>

  );
}

