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
    "/((?!$|api/auth|store/login|admin/login|customer/login|cashier/login|customer/signup|partner-access|about|contact|terms-and-conditions|privacy-policy|forgot-password|reset-password|_next|favicon.ico|icon.png|apple-icon.png|api/stripe/webhook).*)",
  ],
};
