"use server";

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/lib/auth/auth";
import { ObjectId } from "mongodb";

export async function sendPhoneOTPAction(
  phoneNumber: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const requestHeaders = await headers();
    const session = await auth.api.getSession({ headers: requestHeaders });

    if (!session?.user?.id) {
      return { success: false, message: "Not authenticated" };
    }

    // Save phone number to user BEFORE sending OTP
    // so Better Auth can find the user during verify
    await db
      .collection("user")
      .updateOne(
        { _id: new ObjectId(session.user.id) },
        { $set: { phoneNumber } },
      );

    await auth.api.sendPhoneNumberOTP({
      body: { phoneNumber },
    });

    return { success: true, message: "OTP sent successfully" };
  } catch (error: any) {
    console.error("[sendPhoneOTPAction]", error);
    return { success: false, message: "Failed to send OTP. Please try again." };
  }
}
