"use server";

import { auth } from "@/lib/auth/auth";
import { IFormActionResponse } from "@/types/form";
import { loginSchema } from "@/zod/schemas/login";
import { zodErrorResponse } from "@/zod/validation/error";
import { formDataToObject } from "@/zod/validation/form";
import { headers } from "next/headers";

const roleRedirectMap = {
  customer: "/customer",
  admin: "/admin",
  store: "/store",
  cashier: "/cashier",
} as const;

const rolePortalNameMap: Record<string, string> = {
  customer: "Customer",
  admin: "Admin",
  store: "Store",
  cashier: "Cashier",
};

const roleLoginPageMap: Record<string, string> = {
  customer: "/login",
  admin: "/admin/login",
  store: "/store/login",
  cashier: "/cashier/login",
};

type LoginActionResponse = IFormActionResponse & {
  redirectTo?: string;
};

export const loginAction = async (
  prevState: IFormActionResponse,
  formData: FormData,
): Promise<LoginActionResponse> => {
  try {
    const rawData = formDataToObject(formData);
    const result = loginSchema.safeParse(rawData);

    if (!result.success) {
      const errorMessage = zodErrorResponse(result);
      return {
        success: false,
        message: errorMessage || "Validation error",
      };
    }

    const data = result.data;
    const requestHeaders = await headers();

    const signInResult = await auth.api.signInEmail({
      body: {
        email: data.email,
        password: data.password,
      },
      headers: requestHeaders,
    });

    const user = signInResult?.user;

    if (!user) {
      return {
        success: false,
        message: "Login succeeded, but session could not be loaded.",
      };
    }

    const actualRole = user.role;
    const expectedRole = data.role;

if (actualRole !== expectedRole) {
  await auth.api.signOut({
    headers: requestHeaders,
  });

  const safeActualRole = actualRole ?? "";
  const safeExpectedRole = expectedRole ?? "";

  const actualPortalName = rolePortalNameMap[safeActualRole] ?? safeActualRole;
  const expectedPortalName =
    rolePortalNameMap[safeExpectedRole] ?? safeExpectedRole;
  const correctLoginPage = roleLoginPageMap[safeActualRole] ?? "/login";

  return {
    success: false,
    message: `This is the ${expectedPortalName} portal. Your account belongs to the ${actualPortalName} portal.`,
    redirectTo: correctLoginPage,
  };
}

    return {
      success: true,
      message: "Logged in successfully!",
      redirectTo: roleRedirectMap[expectedRole],
    };
  } catch (error: any) {
    console.log("Error while logging in:", error);

    if (error?.body?.code === "EMAIL_NOT_VERIFIED") {
      return {
        success: false,
        message:
          "Your email is not verified. We've sent you a verification email. Please verify your email and then log in again.",
      };
    }

    return {
      success: false,
      message: error?.body?.message || "Something went wrong while signing in",
    };
  }
};

export const logoutAction = async (): Promise<IFormActionResponse> => {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });

    return {
      success: true,
      message: "Logged out successfully!",
    };
  } catch (error: any) {
    console.log("Error while logging out:", error);

    return {
      success: false,
      message: error?.body?.message || "Something went wrong while logging out",
    };
  }
};
