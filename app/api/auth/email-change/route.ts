import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { dbConnect } from "@/db/dbConnect";
import Customer from "@/db/models/customer/customer.model";
import { revalidatePath, revalidateTag } from "next/cache";
import Store from "@/db/models/store/store.model";

export async function GET(req: NextRequest) {
  await auth.handler(req);

  const session = await auth.api.getSession({
    headers: req.headers,
  });

  const userType = session?.user.role;

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  await dbConnect();

  if(userType ==="customer"){
  await Customer.updateOne(
    { userId: session.user.id },
    { $set: { email: session.user.email } }
  );
  }
  if(userType==="store"){
    await Store.updateOne({userId:session.user.id},{$set:{email:session.user.email}})
  }

  revalidatePath(`/${userType}/profile`);
  if(userType==='customer'){
    revalidateTag("customer", "max");
    revalidateTag("customer-and-store", "max");
  }

  return NextResponse.redirect(new URL("/email-updated", req.url));
}