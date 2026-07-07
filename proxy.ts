import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";

const ROLE_HOME: Record<string, string> = {
  customer: "/customer",
  admin: "/admin",
  cashier: "/cashier",
  store: "/store",
  immigration: "/immigration",
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    if (pathname.startsWith("/admin"))
      return NextResponse.redirect(new URL("/admin/login", request.url));
    if (pathname.startsWith("/cashier"))
      return NextResponse.redirect(new URL("/cashier/login", request.url));
    if (pathname.startsWith("/store"))
      return NextResponse.redirect(new URL("/store/login", request.url));
    if (pathname.startsWith("/immigration"))
      return NextResponse.redirect(new URL("/immigration/login", request.url));
    return NextResponse.redirect(new URL("/customer/login", request.url));
  }

  const role = session.user.role as string;
  const home = ROLE_HOME[role];

  if (pathname.startsWith("/customer") && role !== "customer")
    return NextResponse.redirect(new URL(home, request.url));
  if (pathname.startsWith("/admin") && role !== "admin")
    return NextResponse.redirect(new URL(home, request.url));
  if (pathname.startsWith("/cashier") && role !== "cashier")
    return NextResponse.redirect(new URL(home, request.url));
  if (pathname.startsWith("/store") && role !== "store")
    return NextResponse.redirect(new URL(home, request.url));
  if (pathname.startsWith("/immigration") && role !== "immigration")
    return NextResponse.redirect(new URL(home, request.url));
  
  // Gate unverified customers
  if (
    role === "customer" &&
    !session.user.phoneNumberVerified &&
    !pathname.startsWith("/verify-phone")
  ) {
    return NextResponse.redirect(new URL("/verify-phone", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!$|api/auth|store/login|admin/login|customer/login|cashier/login|immigration/login|customer/signup|partner-access|about|referrals|contact|email-verified|terms-and-conditions|careers|privacy-policy|forgot-password|reset-password|verify-phone|promotions|_next|favicon.ico|icon.png|apple-icon.png|apple-touch-icon.png|api/stripe/webhook|api/inngest|sitemap\\.xml|robots\\.txt|google0e73eb402c7f3d0e\\.html).*)",
  ],
};
