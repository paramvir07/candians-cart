// components/customer/landing/NavbarWrapper.tsx
// Server Component — checks auth, passes result to client Navbar

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import Navbar from "@/components/landing/Navbar";


export default async function NavbarWrapper() {
  let isLoggedIn = false;

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    isLoggedIn = !!session;
  } catch {
    isLoggedIn = false;
  }

  return <Navbar isLoggedIn={isLoggedIn} />;
}