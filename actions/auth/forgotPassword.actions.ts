"use server";

import { auth, db } from "@/lib/auth/auth";
import { passwordSchema } from "@/zod/schemas/customer/customerSignup";
import crypto from "crypto";

type UserDoc = {
  _id: string;
  phoneNumber: string;
  phoneNumberVerified: boolean;
  email: string;
};

// Step 1 — send OTP to phone number
export async function sendForgotPasswordOTPAction(
  phoneNumber: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const user = await db.collection<UserDoc>("user").findOne({
      phoneNumber,
      phoneNumberVerified: true,
    });

    // Don't reveal whether number is registered (prevents enumeration)
    if (!user) {
      return { success: true, message: "Code sent if number is registered." };
    }

    await auth.api.sendPhoneNumberOTP({
      body: { phoneNumber },
    });

    return { success: true, message: "Verification code sent!" };
  } catch (error) {
    console.error("[sendForgotPasswordOTPAction]", error);
    return {
      success: false,
      message: "Failed to send code. Please try again.",
    };
  }
}

// Step 2 — verify OTP, return a short-lived reset token
export async function verifyForgotPasswordOTPAction(
  phoneNumber: string,
  code: string,
): Promise<{ success: boolean; message: string; resetToken?: string }> {
  try {
    const user = await db.collection<UserDoc>("user").findOne({
      phoneNumber,
      phoneNumberVerified: true,
    });

    if (!user) {
      return { success: false, message: "Phone number not found." };
    }

    // Verify OTP via Better Auth's API
    const response = await fetch(
      `${process.env.BETTER_AUTH_URL}/api/auth/phone-number/verify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, code }),
      },
    );

    if (!response.ok) {
      return {
        success: false,
        message: "Invalid or expired code. Please try again.",
      };
    }

    // Generate a short-lived reset token (10 minutes)
    const resetToken = crypto.randomBytes(32).toString("hex");

    await db.collection("phone_password_reset").insertOne({
      token: resetToken,
      userId: user._id,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      createdAt: new Date(),
    });

    return { success: true, message: "OTP verified!", resetToken };
  } catch (error) {
    console.error("[verifyForgotPasswordOTPAction]", error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
}

// Step 3 — set new password using reset token
export async function resetPasswordWithPhoneAction(
  resetToken: string,
  newPassword: string,
): Promise<{ success: boolean; message: string }> {
  const parsedPassword = passwordSchema.safeParse(newPassword);

  if (!parsedPassword.success) {
    return {
      success: false,
      message:
        parsedPassword.error.issues[0]?.message ??
        "Password does not meet the requirements.",
    };
  }
  try {
    const record = await db
      .collection<{
        token: string;
        userId: string;
        expiresAt: Date;
      }>("phone_password_reset")
      .findOne({
        token: resetToken,
        expiresAt: { $gt: new Date() },
      });

    if (!record) {
      return {
        success: false,
        message: "Session expired. Please start again.",
      };
    }

    // Use Better Auth's internal context to hash the password
    const ctx = await auth.$context;
    const hashedPassword = await ctx.password.hash(parsedPassword.data);

    // Update the password in the account collection directly
    await db
      .collection("account")
      .updateOne(
        { userId: record.userId, providerId: "credential" },
        { $set: { password: hashedPassword } },
      );

    // Revoke every existing session for this user
    await db.collection("session").deleteMany({ userId: record.userId });

    // Clean up used token
    await db
      .collection("phone_password_reset")
      .deleteOne({ token: resetToken });

    return { success: true, message: "Password updated successfully!" };
  } catch (error) {
    console.error("[resetPasswordWithPhoneAction]", error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
}
