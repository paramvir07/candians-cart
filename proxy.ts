import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.redirect(new URL("/customer/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Make all routes protectected except the ones listed in the negative lookahead in the next line
    "/((?!api/auth|store/login|admin/login|customer/login|cashier/login|customer/signup|partner-access|_next|favicon.ico|api/stripe/webhook).*)",
  ],
};
