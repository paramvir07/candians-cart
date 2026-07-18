"use server";

import { dbConnect } from "@canadian-cart/db/dbConnect";
import ReferralCode from "@canadian-cart/db/models/admin/referralCode.model";
import { IFormActionResponse } from "@canadian-cart/types/form";
import { validateReferralCodeSchema } from "@canadian-cart/types/schemas/customer/validateReferralCode";
import { zodErrorResponse } from "@canadian-cart/types/validation/error";
import { formDataToObject } from "@canadian-cart/types/validation/form";

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
