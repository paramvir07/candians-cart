import { z } from "zod";

export const reportSchema = z.object({
  email: z.email("Invalid email address").transform((v) => v.trim().toLowerCase()),
  subject: z.string().min(3, "Too short").max(120),
  message: z.string().min(10, "Too short").max(2000),
  category: z.enum(["bug", "question", "feature", "other"]),
});

export type ReportInput = z.infer<typeof reportSchema>;