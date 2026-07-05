import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import HeroSection from "./hero-section";
import { HeroPromoStrip } from "./HeropromoStrip";

export default async function HeroSectionWrapper() {
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

  return (
    <HeroSection isLoggedIn={isLoggedIn} promoSlot={<HeroPromoStrip />} role={role}/>
  );
}