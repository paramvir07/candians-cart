// app/customer/layout.tsx
export const dynamic = "force-dynamic";
import BottomNavbar from "@/components/customer/landing/BottomNavbar";
import { Footer } from "@/components/customer/landing/Footer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex-1 w-full h-full">{children}</div>
      <BottomNavbar />
      <div className="h-16 md:hidden" />
      <Footer />
    </>
  );
}