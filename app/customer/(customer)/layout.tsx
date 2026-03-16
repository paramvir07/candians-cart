export const dynamic = "force-dynamic";

import { getUserSession } from "@/actions/auth/getUserSession.actions";
import { Footer } from "@/components/customer/landing/Footer";
import { redirect } from "next/navigation";

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
  return(
  <>
  {children}
  <Footer/>
  </>
  ) 
    
}
