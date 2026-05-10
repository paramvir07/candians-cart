// components/landing/PacksSectionWrapper.tsx
// Server Component — checks auth, passes result to client PacksSection

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import PacksSection from "@/components/landing/Packs";

export default async function PacksSectionWrapper() {
  let isLoggedIn = false;

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    isLoggedIn = !!session;
  } catch {
    isLoggedIn = false;
  }

  return <PacksSection isLoggedIn={isLoggedIn} />;
}
