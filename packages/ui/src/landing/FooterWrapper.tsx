// components/landing/FooterWrapper.tsx
// Server Component — checks auth, passes result to client Footer

import { headers } from "next/headers";
import { auth } from "@canadian-cart/lib/auth/auth";
import Footer from "@canadian-cart/ui/landing/Footer";

export default async function FooterWrapper() {
  let isLoggedIn = false;

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    isLoggedIn = !!session;
  } catch {
    isLoggedIn = false;
  }

  return <Footer isLoggedIn={isLoggedIn} />;
}
