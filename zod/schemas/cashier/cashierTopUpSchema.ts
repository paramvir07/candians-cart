import { z } from "zod";

export const walletTopUpZodSchema = z.object({
  customerId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid customerId format" }),

  value: z
    .number({ message: "Top-up value must be a number" })
    .int({ message: "Top-up value must be an integer (in cents)" })
    .nonnegative({ message: "Top-up value cannot be negative" }),

  paymentMode: z.enum(["cash", "card", "gift"], {
    message: "Payment mode must be either 'cash' or 'card'",
  }),
});

export type WalletTopUpInput = z.infer<typeof walletTopUpZodSchema>;
