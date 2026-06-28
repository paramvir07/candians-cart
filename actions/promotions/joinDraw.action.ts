"use server";

import { dbConnect } from "@/db/dbConnect";
import { getUserSession } from "../auth/getUserSession.actions";
import Customer from "@/db/models/customer/customer.model";

type JoinDrawResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function joinDraw(): Promise<JoinDrawResult> {
  try {
    const session = await getUserSession();
    const authUserId = session.user.id;

    await dbConnect();

    const customer = await Customer.findOne({ userId: authUserId });

    if (!customer) {
      return { success: false, error: "Customer record not found." };
    }

    if (customer.eventParticipant === "winner") {
      return { success: false, error: "You are already a winner!" };
    }

    if (customer.eventParticipant === "participant") {
      return { success: false, error: "You have already joined the draw." };
    }

    // Mark as participant
    customer.eventParticipant = "participant";
    await customer.save();

    return { success: true, message: "You're in the draw! Good luck 🎉" };
  } catch (error) {
    console.error("joinDraw error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}