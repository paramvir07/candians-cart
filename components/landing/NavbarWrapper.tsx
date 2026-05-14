import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import Navbar from "@/components/landing/Navbar";

export default async function NavbarWrapper() {
  let isLoggedIn = false;
  let role: "customer" | "store" | "admin" | "cashier" = "customer";

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    isLoggedIn = !!session;
    if (session?.user?.role) {
      role = session.user.role as typeof role;
    }
  } catch {
    isLoggedIn = false;
  }

  return <Navbar isLoggedIn={isLoggedIn} role={role} />;
}