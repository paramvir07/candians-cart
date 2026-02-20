"use server";

import { dbConnect } from "@/db/dbConnect";
import ReferralCode from "@/db/models/admin/referralCode.model";
import Customer from "@/db/models/customer/customer.model";
import Store from "@/db/models/store/store.model";
import { auth } from "@/lib/auth/auth";
import { UserRole } from "@/types/auth";
import { IFormActionResponse } from "@/types/form";
import { adminSignupSchema } from "@/zod/schemas/admin/adminSignup";
import { CustomerSchema } from "@/zod/schemas/customer/customerSignup";
import { storeSignupSchema } from "@/zod/schemas/store/storeSignup";
import { zodErrorResponse } from "@/zod/validation/error";
import { formDataToObject } from "@/zod/validation/form";

export const signupAction = async (
  userRole: UserRole,
  prevState: IFormActionResponse,
  formData: FormData,
): Promise<IFormActionResponse> => {
  try {
    const rawData = formDataToObject(formData);

    if (userRole === "customer") {
      const result = CustomerSchema.safeParse(rawData);
      if (!result.success) {
        const errorMessage = zodErrorResponse(result);
        return { success: false, message: errorMessage || "Validation error" };
      }

      const data = result.data;

      const referralCode = await ReferralCode.findOne({
        code: data.referralCode,
      });
      if (!referralCode)
        return {
          success: false,
          message: "Referral Code not found",
        };

      const newCustomer = await auth.api.signUpEmail({
        body: { name: data.name, email: data.email, password: data.password },
      });

      await dbConnect();
      await Customer.create({
        userId: newCustomer.user.id,
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        address: data.address,
        city: data.city,
        province: data.province,
        monthlyBudget: data.monthlyBudget,
        associatedStoreId: data.associatedStoreId,
        referralCode: data.referralCode,
      });
    } else if (userRole === "store") {
      const result = storeSignupSchema.safeParse(rawData);
      if (!result.success) {
        const errorMessage = zodErrorResponse(result);
        return { success: false, message: errorMessage || "Validation error" };
      }

      const data = result.data;
      const newStore = await auth.api.createUser({
        body: {
          name: data.name,
          email: data.email,
          password: data.password,
          role: "store",
        },
      });

      await dbConnect();
      await Store.create({
        userId: newStore.user.id,
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        address: data.address,
      });
    } else if (userRole === "admin") {
      const result = adminSignupSchema.safeParse(rawData);
      if (!result.success) {
        const errorMessage = zodErrorResponse(result);
        return { success: false, message: errorMessage || "Validation error" };
      }

      const data = result.data;
      await auth.api.createUser({
        body: {
          name: data.name,
          email: data.email,
          password: data.password,
          role: "admin",
        },
      });
    } else {
      return {
        success: false,
        message: "Something went wrong while creating account",
      };
    }
    return { success: true, message: "Account created successfully!!" };
  } catch (error) {
    console.log("Error while creating creating new account: ", error);
    return {
      success: false,
      message: "Something went wrong while creating account",
    };
  }
};
