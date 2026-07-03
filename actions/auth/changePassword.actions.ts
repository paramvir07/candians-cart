"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { passwordSchema } from "@/zod/schemas/customer/customerSignup";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "New passwords don't match.",
  });

export async function changePasswordAction(
  _: unknown,
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  const raw = {
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = changePasswordSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid password.",
    };
  }

  try {
    await auth.api.changePassword({
      headers: await headers(),
      body: {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
        revokeOtherSessions: true,
      },
    });

    return {
      success: true,
      message: "Password updated successfully.",
    };
  } catch (error: any) {
    const isInvalidPassword =
      error?.body?.code === "INVALID_PASSWORD" ||
      error?.body?.message === "Invalid password" ||
      error?.message === "Invalid password";

    if (isInvalidPassword) {
      return {
        success: false,
        message: "Your current password is incorrect.",
      };
    }

    console.error("changePasswordAction error:", error);

    return {
      success: false,
      message: "Could not update password. Please try again.",
    };
  }
}
``;
