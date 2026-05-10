"use server";

import { IFormActionResponse } from "@/types/form";
import { getUserSession } from "../auth/getUserSession.actions";
import { formDataToObject } from "@/zod/validation/form";
import { createPublicNotificationSchema } from "@/zod/schemas/notification/notification";
import { zodErrorResponse } from "@/zod/validation/error";
import { dbConnect } from "@/db/dbConnect";
import { Types } from "mongoose";
import Notification, { INotification } from "@/db/models/customer/notification/Notification";
import NotificationUser from "@/db/models/customer/notification/UserNotification";

// ─────────────────────────────────────────────
// ADMIN: Create a global notification
// ─────────────────────────────────────────────

export async function createGlobalNotification(
  formData: FormData
): Promise<IFormActionResponse> {
  const session = await getUserSession();

  if (!session || session.user.role?.toUpperCase() !== "ADMIN") {
  return { success: false, message: "Unauthorized: Invalid Role" };
}

  const raw = formDataToObject(formData);
  const parsed = createPublicNotificationSchema.safeParse(raw);

  // zodErrorResponse takes the full safeParse result and returns string | null
  const validationError = zodErrorResponse(parsed);
  if (validationError) {
    return { success: false, message: validationError };
  }

  // At this point TS doesn't know parsed.success is true, so we assert
  if (!parsed.success) return { success: false, message: "Validation failed" };

  await dbConnect();

  await Notification.create({
    title: parsed.data.title,
    message: parsed.data.message,
    type: "GLOBAL",
    createdBy: new Types.ObjectId(session.user.id),
    systemGenerated: false,
  });

  return { success: true, message: "Notification sent to all customers" };
}

// ─────────────────────────────────────────────
// CUSTOMER: Get all notifications (global + private)
// with read/unread status resolved per user
// ─────────────────────────────────────────────

export interface NotificationWithStatus {
  _id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string; // ISO string — Dates can't be passed from server actions to client
  status: "READ" | "UNREAD";
}

// .lean() strips the Mongoose Document wrapper but TS doesn't add timestamps automatically
type LeanNotification = INotification & {
  _id: Types.ObjectId;
  __v: number;
  createdAt: Date;
  updatedAt: Date;
};

export async function getCustomerNotifications(): Promise<{
  success: boolean;
  data?: NotificationWithStatus[];
  message?: string;
}> {
  const session = await getUserSession();

  if (!session) {
    return { success: false, message: "Unauthorized" };
  }

  await dbConnect();

  const customerId = new Types.ObjectId(session.user.id);

  const notifications = await Notification.find({
    $or: [{ type: "GLOBAL" }, { type: "PRIVATE", targetCustomer: customerId }],
  })
    .sort({ createdAt: -1 })
    .lean<LeanNotification[]>();

  if (notifications.length === 0) {
    return { success: true, data: [] };
  }

  const notificationIds = notifications.map((n) => n._id);

  const readRecords = await NotificationUser.find({
    customerId,
    notificationId: { $in: notificationIds },
  })
    .select("notificationId")
    .lean();

  const readSet = new Set(readRecords.map((r) => r.notificationId.toString()));

  const data: NotificationWithStatus[] = notifications.map((n) => ({
    _id: n._id.toString(),
    title: n.title,
    message: n.message,
    type: n.type,
    createdAt: n.createdAt.toISOString(),
    status: readSet.has(n._id.toString()) ? "READ" : "UNREAD",
  }));

  return { success: true, data };
}

// ─────────────────────────────────────────────
// CUSTOMER: Get unread notification count
// ─────────────────────────────────────────────

export async function getUnreadNotificationCount(): Promise<{
  success: boolean;
  count?: number;
  message?: string;
}> {
  const session = await getUserSession();

  if (!session) {
    return { success: false, message: "Unauthorized" };
  }

  await dbConnect();

  const customerId = new Types.ObjectId(session.user.id);

  const totalCount = await Notification.countDocuments({
    $or: [{ type: "GLOBAL" }, { type: "PRIVATE", targetCustomer: customerId }],
  });

  const readCount = await NotificationUser.countDocuments({ customerId });

  const count = Math.max(0, totalCount - readCount);

  return { success: true, count };
}

// ─────────────────────────────────────────────
// CUSTOMER: Mark notifications as read (bulk)
// ─────────────────────────────────────────────

export async function markNotificationsAsRead(
  notificationIds: string[]
): Promise<{ success: boolean; message?: string }> {
  const session = await getUserSession();

  if (!session) {
    return { success: false, message: "Unauthorized" };
  }

  if (!notificationIds.length) {
    return { success: true };
  }

  await dbConnect();

  const customerId = new Types.ObjectId(session.user.id);

  const docs = notificationIds.map((id) => ({
    notificationId: new Types.ObjectId(id),
    customerId,
    status: "READ" as const,
  }));

  await NotificationUser.insertMany(docs, { ordered: false }).catch((err) => {
    if (err?.code !== 11000 && err?.name !== "BulkWriteError") throw err;
  });

  return { success: true };
}

// "use server";

// import { IFormActionResponse } from "@/types/form";
// import { getUserSession } from "../auth/getUserSession.actions";
// import { formDataToObject } from "@/zod/validation/form";
// import { createPublicNotificationSchema } from "@/zod/schemas/notification/notification";
// import { zodErrorResponse } from "@/zod/validation/error";
// import { dbConnect } from "@/db/dbConnect";
// import mongoose from "mongoose";
// import { Types } from "mongoose";
// import Notification from "@/db/models/notification/Notification";

// export interface IRawData {
//   title: string;
//   message: string;
//   type: string;
//   targetCustomer?: string;
// }

// export const createNotificationForm = async (
//   prevState: IFormActionResponse,
//   formData: FormData,
// ): Promise<IFormActionResponse> => {
//   try {
//     const session = await getUserSession();
//     if (!session || session.user.role !== "admin")
//       return { success: false, message: "Unauthorized" };

//     const rawData = formDataToObject(formData);
//     const result = createPublicNotificationSchema.safeParse(rawData);
//     if (!result.success) {
//       const errorMessage = zodErrorResponse(result);
//       return { success: false, message: errorMessage || "Validation Error" };
//     }
//     const data = result.data;
//     await dbConnect();
//     if (data.type === "GLOBAL") {
//       // Global Notification
//       await Notification.create({
//         title: data.title,
//         message: data.message,
//         type: "GLOBAL",
//         createdBy: session.user.id,
//       });
//     } else if (data.type === "PRIVATE") {
//       // Private Notification
//       const id = rawData.targetCustomer;
//       if (typeof id !== "string") {
//         return { success: false, message: "Invalid target customer id" };
//       }
//       if (!mongoose.Types.ObjectId.isValid(id)) {
//         return { success: false, message: "Invalid target customer id" };
//       }
//       const objectId = new mongoose.Types.ObjectId(id);
//       await Notification.create({
//         title: data.title,
//         message: data.message,
//         type: "PRIVATE",
//         createdBy: session.user.id,
//         targetCustomer: objectId,
//       });
//     } else {
//       return { success: false, message: "Invalid notification type" };
//     }
//     return { success: true, message: "Notification created successfully" };
//   } catch (error) {
//     console.log("Error while creating a notification", error);
//     return {
//       success: false,
//       message: "Something went wrong while creating the notification",
//     };
//   }
// };

// // export const createNotificationHandler = async (data: IRawData, customerId?: string) => {
// //     await dbConnect();
// //     if (data.type === "GLOBAL") {
// //       // Global Notification
// //       await Notification.create({
// //         title: data.title,
// //         message: data.message,
// //         type: "GLOBAL",
// //       });
// //       return { success: true, message: "Notification created successfully" };
// //     } else if (data.type === "PRIVATE") {
// //       // Private Notification
// //       const id = rawData.targetCustomer;
// //       if (typeof id !== "string") {
// //         return { success: false, message: "Invalid target customer id" };
// //       }
// //       if (!mongoose.Types.ObjectId.isValid(id)) {
// //         return { success: false, message: "Invalid target customer id" };
// //       }
// //       const objectId = new mongoose.Types.ObjectId(id);
// //       await Notification.create({
// //         title: data.title,
// //         message: data.message,
// //         type: "PRIVATE",
// //         targetCustomer: objectId,
// //       });
// //       return { success: true, message: "Notification created successfully" };
// //     }
// //     return { success: true, message: "Notification created successfully" };
// // }


// export const createNotificationFunction = async (rawData: IRawData) => {
//   try {
//     const result = createPublicNotificationSchema.safeParse(rawData);
//     if (!result.success) {
//       const errorMessage = zodErrorResponse(result);
//       return { success: false, message: errorMessage || "Validation Error" };
//     }
//     const data = result.data;
//     await dbConnect();
//     if (data.type === "GLOBAL") {
//       // Global Notification
//       await Notification.create({
//         title: data.title,
//         message: data.message,
//         type: "GLOBAL",
//       });
//       return { success: true, message: "Notification created successfully" };
//     } else if (data.type === "PRIVATE") {
//       // Private Notification
//       const id = rawData.targetCustomer;
//       if (typeof id !== "string") {
//         return { success: false, message: "Invalid target customer id" };
//       }
//       if (!mongoose.Types.ObjectId.isValid(id)) {
//         return { success: false, message: "Invalid target customer id" };
//       }
//       const objectId = new mongoose.Types.ObjectId(id);
//       await Notification.create({
//         title: data.title,
//         message: data.message,
//         type: "PRIVATE",
//         targetCustomer: objectId,
//       });
//       return { success: true, message: "Notification created successfully" };
//     }
//     return { success: true, message: "Notification created successfully" };
//   } catch (error) {
//     console.log("Error while creating a notification", error);
//     return {
//       success: false,
//       message: "Something went wrong while creating the notification",
//     };
//   }
// };

// /** rewturns all public notifications and notifications sent by some user */
// export const getAllNotificationsAdmin = async () => {
//   try {
//     const session = await getUserSession();
//     if (!session || session.user.role !== "admin")
//       return { success: false, message: "Unauthorized" };
//     await dbConnect();
//     const result = await Notification.find({
//       $or: [{ type: "GLOBAL" }, { createdBy: { $ne: "" } }],
//     });
//     return { success: true, data: result };
//   } catch (err) {}
// };

// export const getAllNotificationsUser = async () => {
//   try {
//     const session = await getUserSession();
//     if (!session || session.user.role !== "admin")
//       return { success: false, message: "Unauthorized" };
//     const customerId = new Types.ObjectId(session.user.id);
//     await dbConnect();
//     const result = await Notification.aggregate([
//       {
//         $match: {
//           $or: [
//             { type: "GLOBAL" },
//             { type: "PRIVATE", targetCustomer: customerId },
//           ],
//         },
//       },
//       {
//         $lookup: {
//           from: "notificationusers", // collection name (lowercase plural)
//           let: { notificationId: "$_id" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ["$notificationId", "$$notificationId"] },
//                     { $eq: ["$customerId", customerId] },
//                   ],
//                 },
//               },
//             },
//           ],
//           as: "userStatus",
//         },
//       },
//       {
//         $addFields: {
//           status: {
//             $cond: {
//               if: { $gt: [{ $size: "$userStatus" }, 0] },
//               then: { $arrayElemAt: ["$userStatus.status", 0] },
//               else: "UNREAD",
//             },
//           },
//         },
//       },
//       {
//         $project: {
//           userStatus: 0, // clean up junk
//         },
//       },
//       {
//         $sort: { createdAt: -1 },
//       },
//     ]);
//     return { success: true, data: result };
//   } catch (error) {}
// };
