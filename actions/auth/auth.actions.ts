"use server";

import { auth } from "@/lib/auth";
import { FormActionResponse } from "@/types/forms/auth";
import { loginSchema } from "@/zod/schemas/login";
import { formDataToObject } from "@/zod/validation/form";
import { headers } from "next/headers";

export const loginAction = async (
  prevState: FormActionResponse,
  formData: FormData,
): Promise<FormActionResponse> => {
  const rawData = formDataToObject(formData);
  const result = loginSchema.safeParse(rawData);

  if (!result.success) {
    const firstError = result.error.issues[0];
    const message = ` ${firstError ? `${firstError.path}: ${firstError.message}` : "Validation Error"}`;
    return {
      success: false,
      message,
    };
  }

  try {
    await auth.api.signInEmail({
      body: {
        email: result.data.email,
        password: result.data.password,
      },
    });
    return {
      success: true,
      message: "Logged in successfully!!",
    };
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong while signing in",
    };
  }
};

export const logoutAction = async () => {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
    return {
      success: true,
      message: "Logged out successfully!!",
    };
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong while logging out",
    };
  }
};
