import { z } from "zod";

export const walletTopUpZodSchema = z
  .object({
    customerId: z.string().regex(/^[0-9a-fA-F]{24}$/, {
      message: "Invalid customerId format",
    }),
    value: z
      .number({ message: "Top-up value must be a number" })
      .int({ message: "Top-up value must be in whole cents" })
      .positive({ message: "Top-up value must be greater than zero" }),
    cashReceived: z
      .number({ message: "Cash received must be a number" })
      .int({ message: "Cash received must be in whole cents" })
      .nonnegative({ message: "Cash received cannot be negative" }),
    cashDue: z
      .number({ message: "Cash due must be a number" })
      .int({ message: "Cash due must be in whole cents" })
      .nonnegative({ message: "Cash due cannot be negative" }),
    paymentMode: z.enum(["cash", "card", "gift", "referral"], {
      message: "Invalid payment mode",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMode === "cash" && data.cashReceived < data.value) {
      ctx.addIssue({
        code: "custom",
        path: ["cashReceived"],
        message: "Cash received must cover the top-up amount",
      });
    }

    if (
      data.paymentMode !== "cash" &&
      (data.cashReceived !== 0 || data.cashDue !== 0)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["cashReceived"],
        message: "Cash values must be zero for non-cash payments",
      });
    }
  });

export type WalletTopUpInput = z.infer<typeof walletTopUpZodSchema>;
