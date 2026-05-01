import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long")
    .transform((v) => v.trim()),
  email: z
    .email("Invalid email address")
    .transform((v) => v.trim().toLowerCase()),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s\-().]{7,20}$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  topic: z.enum([
    "General Inquiry",
    "Savings & Pricing",
    "Gift Wallet & Rewards",
    "Technical Support",
    "Partnership",
    "Other",
  ]),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message is too long")
    .transform((v) => v.trim()),
});

export type ContactInput = z.infer<typeof contactSchema>;