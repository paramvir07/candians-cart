// components/landing/FooterWrapper.tsx
// Server Component — checks auth, passes result to client Footer

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import Footer from "@/components/landing/Footer";

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