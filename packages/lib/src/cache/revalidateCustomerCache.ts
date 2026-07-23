"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function revalidateCustomerCache() {
  revalidateTag("customer", "max");
  revalidateTag("customer-and-store", "max");
  revalidatePath("/customer/profile");
  revalidatePath("/customer/profile/edit");
}