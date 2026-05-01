"use server";

import { dbConnect } from "@/db/dbConnect";
import ContactModel from "@/db/models/customer/Contact.model";
import ReportModel from "@/db/models/customer/Report.model";
import { revalidatePath } from "next/cache";

export const getAllRequests = async () => {
  await dbConnect();
  const [helpResult, contactResult] = await Promise.allSettled([
    ReportModel.find().sort({ createdAt: -1 }).lean(),
    ContactModel.find().sort({ createdAt: -1 }).lean(),
  ]);

  return {
    help:
      helpResult.status === "fulfilled"
        ? JSON.parse(JSON.stringify(helpResult.value))
        : [],
    contact:
      contactResult.status === "fulfilled"
        ? JSON.parse(JSON.stringify(contactResult.value))
        : [],
  };
};

export const acceptRequest = async (
  id: string,
  type: "help" | "contact"
): Promise<{ success: boolean }> => {
  try {
    await dbConnect();
    if (type === "help") {
      await ReportModel.findByIdAndUpdate(id, { accepted: true });
    } else {
      await ContactModel.findByIdAndUpdate(id, { accepted: true });
    }
    revalidatePath("/admin/requests");
    return { success: true };
  } catch {
    return { success: false };
  }
};

export const resolveRequest = async (
  id: string,
  type: "help" | "contact"
): Promise<{ success: boolean }> => {
  try {
    await dbConnect();
    if (type === "help") {
      await ReportModel.findByIdAndUpdate(id, { resolved: true });
    } else {
      await ContactModel.findByIdAndUpdate(id, { resolved: true });
    }
    revalidatePath("/admin/requests");
    return { success: true };
  } catch {
    return { success: false };
  }
};