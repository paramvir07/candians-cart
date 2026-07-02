"use server";

import { dbConnect } from "@/db/dbConnect";
import Customer from "@/db/models/customer/customer.model";
import { getUserSession } from "@/actions/auth/getUserSession.actions";

export async function getCustomerAddress(): Promise<string | null> {
  try {
    const session = await getUserSession();
    await dbConnect();
    const customer = await Customer.findOne(
      { userId: session.user.id },
      { address: 1 },
    ).lean();
    return customer?.address ?? null;
  } catch {
    return null;
  }
}
