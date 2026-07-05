"use server";

import { dbConnect } from "@/db/dbConnect";
import ReferralCode from "@/db/models/admin/referralCode.model";
import { IFormActionResponse } from "@/types/form";
import { createReferralCodeSchema } from "@/zod/schemas/admin/referralCode";
import { zodErrorResponse } from "@/zod/validation/error";
import { formDataToObject } from "@/zod/validation/form";
import { Types } from "mongoose";
import { getUserSession } from "../auth/getUserSession.actions";

export type ReferralCodeType = "admin" | "customer" | "all";

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
      uses: 0,
      type: "admin",
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

export const getReferalCodesAction = async (
  page: number = 1,
  limit: number = 5,
  type: ReferralCodeType = "all",
) => {
  try {
    const session = await getUserSession();
    if (session.user.role !== "admin")
      return {
        success: false,
        message: "Unauthorized",
        referralCodes: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: page,
      };

    await dbConnect();

    // guard against garbage input
    const safePage = Math.max(1, Math.floor(page) || 1);
    const safeLimit = Math.max(1, Math.floor(limit) || 10);
    const skip = (safePage - 1) * safeLimit;

    const query = type === "all" ? {} : { type };

    const [referralCodes, totalCount] = await Promise.all([
      ReferralCode.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      ReferralCode.countDocuments(query),
    ]);

    const serializedReferralCodes = JSON.parse(JSON.stringify(referralCodes));
    const totalPages = Math.max(1, Math.ceil(totalCount / safeLimit));

    return {
      success: true,
      message: "Fetched referal codes Successfully!!",
      referralCodes: serializedReferralCodes,
      totalCount,
      totalPages,
      currentPage: safePage,
    };
  } catch (error) {
    console.log("Error while fetching referal codes: ", error);
    return {
      success: false,
      message: "Something went wrong while fetching referal codes",
      referralCodes: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
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
    const updatedReferalId = await ReferralCode.findByIdAndUpdate(
      referalCodeId,
      {
        $set: {
          maxUses: data.maxUses,
          expiresAt: data.expiresAt,
          isActive: data.isActive,
        },
      },
      { returnDocument: "after" },
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