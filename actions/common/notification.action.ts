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
import Customer from "@/db/models/customer/customer.model";

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

// notification read tracker
export interface NotificationReadReceipt {
  customerId: string;
  customerName: string;
  customerEmail: string;
  readAt: string;
}

export async function getNotificationReadReceipts(notificationId: string): Promise<{
  success: boolean;
  notification?: { title: string; message: string; type: string; createdAt: string; targetCustomerId?: string };
  receipts?: NotificationReadReceipt[];
  targetCustomer?: { name: string; email: string; hasRead: boolean };
  message?: string;
}> {
  const session = await getUserSession();
  console.log("1. session:", session?.user.role, session?.user.id);

  if (!session || session.user.role?.toUpperCase() !== "ADMIN") {
    console.log("2. unauthorized - role was:", session?.user.role);
    return { success: false, message: "Unauthorized" };
  }

  await dbConnect();
  console.log("3. notificationId received:", notificationId);

  const notification = await Notification.findById(notificationId).lean<LeanNotification>();
  console.log("4. notification found:", notification);

  if (!notification) return { success: false, message: "Notification not found" };

  let targetCustomer: { name: string; email: string; hasRead: boolean } | undefined;

if (notification.type === "PRIVATE" && notification.targetCustomer) {
  const customer = await Customer.findOne({
    userId: notification.targetCustomer,
  })
    .select("name email userId")
    .lean();

  const hasRead = await NotificationUser.exists({
    notificationId: new Types.ObjectId(notificationId),
    customerId: notification.targetCustomer,
    status: "READ",
  });

  targetCustomer = {
    name: customer?.name ?? "Unknown",
    email: customer?.email ?? "—",
    hasRead: !!hasRead,
  };
}

  const receipts = await NotificationUser.find({
    notificationId: new Types.ObjectId(notificationId),
    status: "READ",
  }).lean();

  // customerId in NotificationUser = userId in Customer
  const userIds = receipts.map((r) => r.customerId);

  const customers = await Customer.find({
    userId: { $in: userIds },
  })
    .select("userId name email")
    .lean();

  // Map by userId string for fast lookup
  const customerMap = new Map(
    customers.map((c) => [c.userId.toString(), c])
  );

  return {
    success: true,
    notification: {
      title: notification.title,
      message: notification.message,
      type: notification.type,
      createdAt: notification.createdAt.toISOString(),
    },
    receipts: notification.type === "GLOBAL"
      ? receipts.map((r) => {
          const customer = customerMap.get(r.customerId.toString());
          return {
            customerId: r.customerId.toString(),
            customerName: customer?.name ?? "Unknown",
            customerEmail: customer?.email ?? "—",
            readAt: (r as any).updatedAt?.toISOString() ?? new Date().toISOString(),
          };
        })
      : [],
    targetCustomer,
  };
}

// Search Customers

export async function searchCustomersForNotification(query: string): Promise<{
  success: boolean;
  data?: { id: string; name: string; email: string }[];
  message?: string;
}> {
  const session = await getUserSession();
  if (!session || session.user.role?.toUpperCase() !== "ADMIN") {
    return { success: false, message: "Unauthorized" };
  }

  await dbConnect();

  const customers = await Customer.find({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
    ],
  })
    .select("_id userId name email")
    .limit(8)
    .lean();

  return {
    success: true,
    data: customers.map((c) => ({
      id: c.userId.toString(), // BetterAuth userId — this is what NotificationUser.customerId stores
      name: c.name,
      email: c.email,
    })),
  };
}

// Create Private notifcatioobns

export async function createPrivateNotification(
  targetCustomerUserId: string,
  title: string,
  message: string,
): Promise<IFormActionResponse> {
  const session = await getUserSession();
  if (!session || session.user.role?.toUpperCase() !== "ADMIN") {
    return { success: false, message: "Unauthorized" };
  }

  await dbConnect();

  await Notification.create({
    title,
    message,
    type: "PRIVATE",
    createdBy: new Types.ObjectId(session.user.id),
    targetCustomer: new Types.ObjectId(targetCustomerUserId),
    systemGenerated: false,
  });

  return { success: true, message: "Private notification sent" };
}

// admin get all notifs
export async function getAllNotificationsAdmin(): Promise<{
  success: boolean;
  data?: NotificationWithStatus[];
  message?: string;
}> {
  const session = await getUserSession();
  if (!session || session.user.role?.toUpperCase() !== "ADMIN") {
    return { success: false, message: "Unauthorized" };
  }

  await dbConnect();

  const notifications = await Notification.find({})
    .sort({ createdAt: -1 })
    .lean<LeanNotification[]>();

  const data: NotificationWithStatus[] = notifications.map((n) => ({
    _id: n._id.toString(),
    title: n.title,
    message: n.message,
    type: n.type,
    createdAt: n.createdAt.toISOString(),
    status: "READ", // irrelevant for admin view
  }));

  return { success: true, data };
}