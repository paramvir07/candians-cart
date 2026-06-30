"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { editProfileSchema } from "@/zod/schemas/customer/customerSignup";
import { getUserSession } from "../auth/getUserSession.actions";
import { dbConnect } from "@/db/dbConnect";

import mongoose from "mongoose";
import Customer, { ICustomer } from "@/db/models/customer/customer.model";
import { zodErrorResponse } from "@/zod/validation/error";
import { formDataToObject } from "@/zod/validation/form";
import { revalidateCustomerCache } from "../cache/user.cache";

export type ProfileState = {
  errors?: {
    name?: string[];
    address?: string[];
    city?: string[];
    province?: string[];
    postalCode?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function editUserProfile(
  prevState: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const currentUser = await getUserSession();

  if (currentUser.user.role !== "customer") {
    return {
      success: false,
      message: "Unauthorized: Only customer can edit this",
    };
  }

  const rawData = formDataToObject(formData);
  const result = await editProfileSchema.safeParseAsync(rawData);

  if (!result.success) {
    const errorMessage = zodErrorResponse(result);
    return { success: false, message: errorMessage || "Validation error" };
  }

  // postalCode added, mobile removed (handled by phone OTP verification)
  const { name, address, city, province, postalCode } = result.data;

  try {
    await dbConnect();
    const session = await mongoose.startSession();

    await session.withTransaction(async () => {
      const customerProfile = await Customer.findOne({
        userId: currentUser.user.id,
      }).session(session);

      if (!customerProfile) {
        throw new Error("Customer_Not_Found");
      }

      const updatePayload: Partial<ICustomer> = {
        name,
        address,
        city,
        province,
        postalCode, // now included
        // mobile intentionally omitted — updated via phone OTP verification
      };

      await Customer.updateOne(
        { _id: customerProfile._id },
        { $set: updatePayload },
        { session },
      );

      await mongoose.connection
        .collection("user")
        .updateOne(
          { _id: new mongoose.Types.ObjectId(currentUser.user.id) },
          { $set: { name: updatePayload.name } },
          { session },
        );
    });

    await session.endSession();

    await revalidateCustomerCache();

    return {
      success: true,
      message: "Profile updated successfully",
      errors: {},
    };
  } catch (error) {
    console.log(`Database error during the profile update: `, error);
    return {
      success: false,
      message: "A server error occurred while updating your profile",
    };
  }
}
