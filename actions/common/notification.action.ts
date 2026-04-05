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
