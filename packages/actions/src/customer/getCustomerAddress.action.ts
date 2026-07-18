"use server";

import { dbConnect } from "@canadian-cart/db/dbConnect";
import Customer from "@canadian-cart/db/models/customer/customer.model";
import { getUserSession } from "@canadian-cart/actions/auth/getUserSession";

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
