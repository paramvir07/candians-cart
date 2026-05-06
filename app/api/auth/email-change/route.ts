import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { dbConnect } from "@/db/dbConnect";
import Customer from "@/db/models/customer/customer.model";
import { revalidatePath, revalidateTag } from "next/cache";

export async function GET(req: NextRequest) {
  await auth.handler(req);

  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  await dbConnect();

  await Customer.updateOne(
    { userId: session.user.id },
    { $set: { email: session.user.email } }
  );

  revalidatePath("/customer/profile");
  revalidateTag("customer", "max");
  revalidateTag("customer-and-store", "max");

  return NextResponse.redirect(new URL("/email-updated", req.url));
}