"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { editProfileSchema } from "@/zod/schemas/customer/customerSignup";
import { z } from "zod";
import { getUserSession } from "../auth/getUserSession.actions";
import { dbConnect } from "@/db/dbConnect";

import mongoose from "mongoose";
import Customer, { ICustomer } from "@/db/models/customer/customer.model";
import { zodErrorResponse } from "@/zod/validation/error";
import { formDataToObject } from "@/zod/validation/form";

export type ProfileState = {
  errors?: {
    name?: string[];
    address?: string[];
    city?: string[];
    province?: string[];
    mobile?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function editUserProfile(
  prevState: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  // Check for user and its role to be customer
  const currentUser = await getUserSession();

  if (currentUser.user.role !== "customer") {
    return {
      success: false,
      message: "Unauthorized: Only customer can edit this",
    };
  }
  const rawData = formDataToObject(formData);
  const result = editProfileSchema.safeParse(rawData);

  if (!result.success) {
    const errorMessage = zodErrorResponse(result);
    return { success: false, message: errorMessage || "Validation error" };
  }

  const { name, address, city, province, mobile } = result.data;

  try {
    await dbConnect();
    // to update the name on both user table and customer table we use session
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
        mobile,
      };

      // updating in Customer table
      await Customer.updateOne(
        { _id: customerProfile._id },
        { $set: updatePayload },
        { session },
      );

      // updating the name in the user table, we have _id in user table and we convert the user.id to Mongoose type
      await mongoose.connection
        .collection("user")
        .updateOne(
          { _id: new mongoose.Types.ObjectId(currentUser.user.id) },
          { $set: { name: updatePayload.name } },
          { session },
        );
    });

    await session.endSession();

    revalidatePath("/customer/profile");
    revalidateTag("customer","max")
    revalidateTag("customer-and-store","max")

    return {
      success: true,
      message: "Profile updated successfully",
      errors: {},
    };
  } catch (error) {
    console.log(`Database error during the profile update: `, error);
    return {
      success: false,
      message: "A server error occured while updating your profile",
    };
  }
}
