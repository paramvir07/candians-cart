import { z } from "zod";

export const walletTopUpZodSchema = z.object({
  customerId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid customerId format" }),

  value: z
    .number({ message: "Top-up value must be a number" })
    .nonnegative({ message: "Top-up value cannot be negative" }),

  cashReceived: z.number({ message: "Cash received must be a number" })
  .nonnegative({ message: "Cash received cannot be negative" }),
  
  cashDue: z.number({ message: "Cash due must be a number" })
  .nonnegative({ message: "Cash due cannot be negative" }),

  paymentMode: z.enum(["cash", "card", "gift","referral"], {
    message: "Payment mode must be either 'cash' or 'card'",
  }),
});

export type WalletTopUpInput = z.infer<typeof walletTopUpZodSchema>;
