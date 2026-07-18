import { z } from "zod";

// ─────────────────────────────────────────────
// Admin: Create a global public notification
// ─────────────────────────────────────────────

export const createPublicNotificationSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be at most 100 characters")
    .trim(),

  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must be at most 1000 characters")
    .trim(),
});

export type CreatePublicNotificationInput = z.infer<
  typeof createPublicNotificationSchema
>;

// ─────────────────────────────────────────────
// Admin: Create a private notification for a specific customer
// ─────────────────────────────────────────────

export const createPrivateNotificationSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be at most 100 characters")
    .trim(),

  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must be at most 1000 characters")
    .trim(),

  targetCustomer: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid customer ID"),
});

export type CreatePrivateNotificationInput = z.infer<
  typeof createPrivateNotificationSchema
>;

// ─────────────────────────────────────────────
// Shared: Mark notifications as read
// ─────────────────────────────────────────────

export const markAsReadSchema = z.object({
  notificationIds: z
    .array(
      z.string().regex(/^[a-f\d]{24}$/i, "Invalid notification ID")
    )
    .min(1, "At least one notification ID is required")
    .max(100, "Cannot mark more than 100 notifications at once"),
});

export type MarkAsReadInput = z.infer<typeof markAsReadSchema>;