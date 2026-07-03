// actions/customer/changeEmail.action.ts
"use server";

import { auth, db } from "@/lib/auth/auth";
import { headers } from "next/headers";

export async function changeEmailAction(
  newEmail: string,
): Promise<{ success: boolean; message: string }> {
  const normalizedEmail = newEmail.trim().toLowerCase();

  if (!normalizedEmail.includes("@")) {
    return { success: false, message: "Enter a valid email." };
  }

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, message: "You must be signed in to do this." };
    }

    if (normalizedEmail === session.user.email.toLowerCase()) {
      return { success: false, message: "That's already your current email." };
    }

    const existing = await db.collection("user").findOne({
      email: normalizedEmail,
    });
    if (existing) {
      return {
        success: false,
        message: "That email is already in use by another account.",
      };
    }

    await auth.api.changeEmail({
      headers: await headers(),
      body: { newEmail: normalizedEmail },
    });

    return {
      success: true,
      message: `Confirmation link sent to ${normalizedEmail}.`,
    };
  } catch (error: any) {
    console.error("[changeEmailAction]", error);
    return {
      success: false,
      message: error?.body?.message ?? "Something went wrong. Please try again.",
    };
  }
}