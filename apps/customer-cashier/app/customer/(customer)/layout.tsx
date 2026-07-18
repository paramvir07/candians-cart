// app/customer/layout.tsx
export const dynamic = "force-dynamic";
import BottomNavbar from "@canadian-cart/ui/customer/landing/BottomNavbar";
import { Footer } from "@canadian-cart/ui/customer/landing/Footer";

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