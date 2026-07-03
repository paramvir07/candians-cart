"use server";

import { dbConnect } from "@/db/dbConnect";
import Customer from "@/db/models/customer/customer.model";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import { CUSTOMER_PROVINCE } from "@/lib/customer/location";
import { z } from "zod";
import { aptUnitSchema } from "@/zod/schemas/customer/customerSignup";
import { revalidateCustomerCache } from "../cache/user.cache";

const addressSchema = z.object({
  aptUnit: aptUnitSchema,
  address: z
    .string()
    .trim()
    .min(1, "Please select your address from the dropdown"),
  city: z.string().trim().min(1, "City is required"),
  province: z.literal(CUSTOMER_PROVINCE, {
    message: "We currently only deliver within British Columbia",
  }),
  postalCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^V\d[A-Z]\s?\d[A-Z]\d$/, "Please enter a valid BC postal code")
    .transform((v) => {
      const cleaned = v.replace(/\s/g, "");
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    }),
});

export async function updateAddressAction(
  _: any,
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  try {
    const raw = {
      aptUnit: formData.get("aptUnit"),
      address: formData.get("address"),
      city: formData.get("city"),
      province: formData.get("province"),
      postalCode: formData.get("postalCode"),
    };

    const result = addressSchema.safeParse(raw);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "Invalid address";
      return { success: false, message };
    }

    const session = await getUserSession();
    await dbConnect();

    const updated = await Customer.findOneAndUpdate(
      { userId: session.user.id },
      {
        $set: {
          aptUnit: result.data.aptUnit,
          address: result.data.address,
          city: result.data.city,
          province: result.data.province,
          postalCode: result.data.postalCode,
        },
      },
      { new: true },
    );

    if (!updated) return { success: false, message: "Customer not found" };

    await revalidateCustomerCache();
    return { success: true, message: "Address saved successfully" };
  } catch (err) {
    console.error("updateAddressAction error:", err);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
}
