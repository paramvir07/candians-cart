"use server";

import { dbConnect } from "@/db/dbConnect";
import { getUserSession } from "../auth/getUserSession.actions";
import Store from "@/db/models/store/store.model";
import { StoreFormPayload } from "@/components/store/Profile/EditStoreProfileForm";
import { revalidatePath } from "next/cache";

export const getStoreData = async () => {
  try {
    const session = await getUserSession();

    if (!session) {
      return {success: false,message: "Unauthorized",data: null,
      };
    }

    await dbConnect();

    const store = await Store.findOne({
      email: session.user.email,
    }).lean();

    if (!store) {
      return {success: false,message: "Store not found",data: null,
      };
    }

    return {
    success: true,
    message: "Store found",
    data: JSON.parse(JSON.stringify(store)),
    };
  } catch (error) {
    console.error("Error fetching store data:", error);

    return {success: false,message: "Error fetching store data",data: null,
    };
  }
};

export const editStoreProfile = async (payload: StoreFormPayload) => {
  try {
    if (!payload?.email)
      return { success: false, message: "Store email is required" };

    const updatedStore = await Store.findOneAndUpdate(
      { email: payload.email.toLowerCase().trim() },
      {
        $set: {
          name: payload.name?.trim(),
          hours: payload.hours,
          address: payload.address?.trim(),
          mobile: payload.mobile?.trim(),
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedStore)
      return { success: false, message: "Store not found" };

    revalidatePath("/store/profile")
    return { success: true, message: "Store updated successfully" };
  } catch (error) {
    console.error("Edit Store Profile Error:", error);
    return { success: false, message: "Failed to edit store profile" };
  }
};