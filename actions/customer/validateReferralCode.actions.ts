"use server";

import { dbConnect } from "@/db/dbConnect";
import ReferralCode from "@/db/models/admin/referralCode.model";
import { IFormActionResponse } from "@/types/form";
import { validateReferralCodeSchema } from "@/zod/schemas/customer/validateReferralCode";
import { zodErrorResponse } from "@/zod/validation/error";
import { formDataToObject } from "@/zod/validation/form";

type ReferralCodeFormActionResponse = IFormActionResponse & {
  referralCode?: string;
};

export const validateReferralCodeAction = async (
  prevState: ReferralCodeFormActionResponse,
  formData: FormData,
): Promise<ReferralCodeFormActionResponse> => {
  try {
    const rawData = formDataToObject(formData);
    const result = validateReferralCodeSchema.safeParse(rawData);
    if (!result.success) {
      const errorMessage = zodErrorResponse(result);
      return { success: false, message: errorMessage || "Validation error" };
    }
    const data = result.data;
    await dbConnect();
    const referralCode = await ReferralCode.findOne({ code: data.code });
    if (!referralCode)
      return {
        success: false,
        message: "Referral Code not found",
      };
    const inactive = !referralCode.isActive;
    const usageFull =
      referralCode.maxUses && referralCode.uses >= referralCode.maxUses;
    const expired =
      referralCode.expiresAt && referralCode.expiresAt.getTime() <= Date.now();

    if (inactive || usageFull || expired)
      return {
        success: false,
        message: "Sorry, this referral code is no longer valid.",
      };

    return {
      success: true,
      message: "Referral Code Validated Successfully!!",
      referralCode: data.code,
    };
  } catch (error) {
    console.log("Error while creating validating referral code: ", error);
    return {
      success: false,
      message: "Something went wrong while validating referral code",
    };
  }
};
