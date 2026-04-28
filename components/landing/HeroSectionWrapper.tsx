import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import HeroSection from "./hero-section";

export default async function HeroSectionWrapper() {
  let isLoggedIn = false;

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    isLoggedIn = !!session;
  } catch {
    isLoggedIn = false;
  }

  return <HeroSection isLoggedIn={isLoggedIn} />;
}
