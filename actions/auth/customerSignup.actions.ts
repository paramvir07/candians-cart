"use server";

import { auth } from "@/lib/auth";
import { FormActionResponse } from "@/types/forms/auth";
import { customerSignupSchema } from "@/zod/schemas/customerSignup";
import { formDataToObject } from "@/zod/validation/form";

export const customerSignupAction = async (
  prevState: FormActionResponse,
  formData: FormData,
): Promise<FormActionResponse> => {
  const rawData = formDataToObject(formData);
  const result = customerSignupSchema.safeParse(rawData);

  if (!result.success) {
    const firstError = result.error.issues[0];
    const message = ` ${firstError ? `${firstError.path}: ${firstError.message}` : "Validation Error"}`;
    return {
      success: false,
      message,
    };
  }

  try {
    await auth.api.signUpEmail({
      body: {
        name: result.data.name,
        email: result.data.email,
        password: result.data.password,
        role: "customer",
        mobile: result.data.mobile,
        hasCar: result.data.hasCar,
        address: result.data.address,
        city: result.data.city,
        province: result.data.province,
      },
    });
    return {
      success: true,
      message: "Account created successfully!!",
    };
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong while creating account",
    };
  }
};
