"use server";

import { auth, db } from "@/lib/auth/auth";
import { headers } from "next/headers";
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

    const userCollection = db.collection<{
      _id: ObjectId;
      phoneNumber: string;
      phoneNumberVerified: boolean;
    }>("user");

    // Convert session.user.id string to ObjectId
    let userObjectId: ObjectId;
    try {
      userObjectId = new ObjectId(session.user.id);
    } catch {
      return { success: false, message: "Invalid user ID" };
    }

    // Check duplicate — someone else already verified this number
    const existingUser = await userCollection.findOne({
      phoneNumber,
      phoneNumberVerified: true,
      _id: { $ne: userObjectId },
    });

    if (existingUser) {
      return {
        success: false,
        message: "This phone number is already registered to another account.",
      };
    }

    // Write phone number to user so Better Auth can find them during verify
    const updated = await userCollection.updateOne(
      { _id: userObjectId },
      { $set: { phoneNumber } },
    );

    console.log("[sendPhoneOTPAction] updateOne result:", updated);

    if (updated.matchedCount === 0) {
      console.error(
        "[sendPhoneOTPAction] user not found with id:",
        session.user.id,
      );
      return {
        success: false,
        message: "User not found. Please log in again.",
      };
    }

    await auth.api.sendPhoneNumberOTP({
      body: { phoneNumber },
    });

    return { success: true, message: "OTP sent successfully" };
  } catch (error: any) {
    console.error("[sendPhoneOTPAction] full error:", error);
    return { success: false, message: "Failed to send OTP. Please try again." };
  }
}
