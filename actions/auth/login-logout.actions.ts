"use server";

import { auth } from "@/lib/auth/auth";
import { IFormActionResponse } from "@/types/form";
import { loginSchema } from "@/zod/schemas/login";
import { zodErrorResponse } from "@/zod/validation/error";
import { formDataToObject } from "@/zod/validation/form";
import { headers } from "next/headers";
import { getUserSession } from "./getUserSession.actions";

export const loginAction = async (
  prevState: IFormActionResponse,
  formData: FormData,
): Promise<IFormActionResponse> => {
  try {
    const rawData = formDataToObject(formData);
    const result = loginSchema.safeParse(rawData);
    if (!result.success) {
      const errorMessage = zodErrorResponse(result);
      return { success: false, message: errorMessage || "Validation error" };
    }

    const data = result.data;

    await auth.api.signInEmail({
      body: {
        email: data.email,
        password: data.password,
      },
    });
    return {
      success: true,
      message: "Logged in successfully!!",
    };
  } catch (error) {
    console.log("Error while logging in: ", error);
    return {
      success: false,
      message: "Something went wrong while signing in",
    };
  }
};

export const logoutAction = async () => {

  try {
    await getUserSession();
    await auth.api.signOut({
      headers: await headers(),
    });
    return {
      success: true,
      message: "Logged out successfully!!",
    };
  } catch (error) {
    console.log("Error while logging out: ", error);
    return {
      success: false,
      message: "Something went wrong while logging out",
    };
  }
};
