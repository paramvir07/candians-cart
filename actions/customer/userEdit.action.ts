"use server";

import { revalidatePath } from "next/cache";
import { editProfileSchema } from "@/zod/schemas/customer/customerSignup";
import { z } from "zod";
import { getUserSession } from "../auth/getUserSession.actions";
import { dbConnect } from "@/db/dbConnect";
import CustomerInfo, {
  ICustomerInfo,
} from "@/db/models/customer/customerInfo.model";
import mongoose from "mongoose";

export type ProfileState = {
  errors?: {
    name?: string[];
    address?: string[];
    city?: string[];
    province?: string[];
    mobile?: string[];
    hasCar?: string[];
    carModel?: string[];
    carYear?: string[];
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
  const rawData = {
    name: formData.get("name")?.toString() ?? "",
    address: formData.get("address")?.toString() ?? "",
    city: formData.get("city")?.toString() ?? "",
    province: formData.get("province")?.toString() ?? "",
    mobile: formData.get("mobile")?.toString() ?? "",
    // check box returns on,
    hasCar:
      formData.get("hasCar") === "on" || formData.get("hasCar") === "true",
    carModel: formData.get("carModel"),
    carYear: formData.get("carYear"),
  };

  const result = editProfileSchema.safeParse(rawData);

  if (!result.success) {
    const { fieldErrors } = z.flattenError(result.error);
    return {
      errors: fieldErrors,
      message: "Please Fix the errors below",
      success: false,
    };
  }

  const { name, address, city, province, mobile, hasCar, carModel, carYear } =
    result.data;

  try {
    await dbConnect();
    // to update the name on both user table and customerInfo table we use session
    const session = await mongoose.startSession();

    await session.withTransaction(async () => {
      const customerProfile = await CustomerInfo.findOne({
        userId: currentUser.user.id,
      }).session(session);

      if (!customerProfile) {
        throw new Error("Customer_Not_Found");
      }

      const updatePayload: Partial<ICustomerInfo> = {
        name,
        address,
        city,
        province,
        mobile,
      };

      // If user dont have a car, allow the update
      if (
        customerProfile.hasCar === false ||
        customerProfile.hasCar === null ||
        customerProfile.hasCar === undefined
      ) {
        updatePayload.hasCar = hasCar;

        // allowing append if form says the car is available
        if (hasCar) {
          updatePayload.carYear = carYear;
          updatePayload.carModel = carModel;
        }
      }
      // Doing noting when the user hasCar, LOCKED

      // updating in CustomerInfo table
      await CustomerInfo.updateOne(
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

    revalidatePath("/profile");

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
