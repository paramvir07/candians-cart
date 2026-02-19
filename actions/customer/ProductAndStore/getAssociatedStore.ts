"use server";

import getUserSession from "@/actions/auth/getUserSession";
import CustomerInfo from "@/db/models/customer/customerInfo.model";
import { dbConnect } from "@/db/dbConnect";

export default async function getStoreAdnProduct() {
  await dbConnect();

  const session = await getUserSession();
  const userId = session.user.id;

  console.log("UserId:", userId);

  const customer = await CustomerInfo.findOne({ userId: userId });

  if (!customer) {
    throw new Error("Customer not found");
  }

  console.log("Customer:", customer);
  console.log("Associated store:", customer.associatedStoreId);
}
