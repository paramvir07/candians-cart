export const dynamic = "force-dynamic";
import { Metadata } from "next";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import { Footer } from "@/components/customer/landing/Footer";
import { redirect } from "next/navigation";
import BottomNavbar from "@/components/customer/landing/BottomNavbar";

export const metadata: Metadata = {
  title: {
    default: "Customer Area",
    template: "%s | Candian's Cart",
  },
  robots: {
    index: false, // Prevents search engines from indexing the user dashboard
    follow: false,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getUserSession();
  const role = session.user.role;

  if (role !== "customer") {
    if (role === "store" || role === "admin" || role === "cashier") {
      redirect(`/${role}`);
    } else {
      redirect("/customer/login");
    }
  }
  return (
    <>
      <div className="flex-1 w-full h-full">{children}</div>
      <BottomNavbar />
      <div className="h-16 md:hidden" />
      <Footer />
    </>
  );
}
