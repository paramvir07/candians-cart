"use server";

import { dbConnect } from "@/db/dbConnect";
import ReferralCode from "@/db/models/admin/referralCode.model";
import { IFormActionResponse } from "@/types/form";
import { createReferralCodeSchema } from "@/zod/schemas/admin/referralCode";
import { zodErrorResponse } from "@/zod/validation/error";
import { formDataToObject } from "@/zod/validation/form";
import { Types } from "mongoose";
import { getUserSession } from "../auth/getUserSession.actions";

export const createReferalCodeAction = async (
  prevState: IFormActionResponse,
  formData: FormData,
): Promise<IFormActionResponse> => {
  try {
    const session = await getUserSession();
    if (session.user.role !== "admin")
      return { success: false, message: "Unauthorized" };
    const rawData = formDataToObject(formData);
    const result = createReferralCodeSchema.safeParse(rawData);
    if (!result.success) {
      const errorMessage = zodErrorResponse(result);
      return { success: false, message: errorMessage || "Validation error" };
    }
    const data = result.data;
    await dbConnect();
    await ReferralCode.create({
      code: data.code,
      maxUses: data.maxUses,
      expiresAt: data.expiresAt,
      isActive: data.isActive,
    });
    return { success: true, message: "Referal Code Created Successfully!!" };
  } catch (error) {
    console.log("Error while creating creating referal code: ", error);
    return {
      success: false,
      message: "Something went wrong while creating referal code",
    };
  }
};

export const getReferalCodesAction = async () => {
  try {
    const session = await getUserSession();

    if (session.user.role !== "admin")
      return { success: false, message: "Unauthorized" };
    await dbConnect();
    const referralCodes = await ReferralCode.find().lean();
    const serializedReferralCodes = JSON.parse(JSON.stringify(referralCodes));
    return { success: true, message: "Fetched referal codes Successfully!!", referralCodes: serializedReferralCodes };
  } catch (error) {
    console.log("Error while fetching referal codes: ", error);
    return {
      success: false,
      message: "Something went wrong while fetching referal codes",
      referralCodes: []
    };
  }
};

export const updateReferalCodeAction = async (
  referalCodeId: Types.ObjectId,
  prevState: IFormActionResponse,
  formData: FormData,
): Promise<IFormActionResponse> => {
  try {
    const session = await getUserSession();

    if (session.user.role !== "admin") return { success: false, message: "Unauthorized" };
    
    const rawData = formDataToObject(formData);
    const result = createReferralCodeSchema.safeParse(rawData);
    if (!result.success) {
      const errorMessage = zodErrorResponse(result);
      return { success: false, message: errorMessage || "Validation error" };
    }
    const data = result.data;

    await dbConnect();
    const updatedReferalId = await ReferralCode.findByIdAndUpdate(
    referalCodeId,
      { $set: { maxUses: data.maxUses, expiresAt: data.expiresAt, isActive: data.isActive } },
      { returnDocument: 'after' },
    );
    if (!updatedReferalId) {
      return {
        success: false,
        message: "Something went wrong while updating referal code",
      };
    }
    return { success: true, message: "Referal Code updated successfully!!" };
  } catch (error) {
    console.log("Error while updating referal code: ", error);
    return {
      success: false,
      message: "Something went wrong while updating referal code",
    };
  }
};
