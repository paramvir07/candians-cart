import { z } from "zod";

export const payoutScheduleSchema = z
  .object({
    enabled: z.boolean(),

    frequency: z.enum(["biweekly", "monthly"], {
      message: "Frequency must be 'biweekly' or 'monthly'",
    }),

    // Only required + validated when frequency = "monthly"
    dayOfMonth: z
      .number()
      .int()
      .min(1, "Day must be at least 1")
      .max(28, "Day must be at most 28 (safe for all months)")
      .optional()
      .default(1),

    // Only required + validated when frequency = "biweekly"
    dayOfWeek: z
      .number()
      .int()
      .min(0, "Day of week must be 0 (Sun) to 6 (Sat)")
      .max(6, "Day of week must be 0 (Sun) to 6 (Sat)")
      .optional()
      .default(1),
  })
  .refine(
    (data) => {
      if (data.frequency === "monthly" && data.enabled) {
        return (
          data.dayOfMonth !== undefined &&
          data.dayOfMonth >= 1 &&
          data.dayOfMonth <= 28
        );
      }
      return true;
    },
    {
      message: "dayOfMonth (1–28) is required when frequency is 'monthly'",
      path: ["dayOfMonth"],
    },
  )
  .refine(
    (data) => {
      if (data.frequency === "biweekly" && data.enabled) {
        return (
          data.dayOfWeek !== undefined &&
          data.dayOfWeek >= 0 &&
          data.dayOfWeek <= 6
        );
      }
      return true;
    },
    {
      message: "dayOfWeek (0–6) is required when frequency is 'biweekly'",
      path: ["dayOfWeek"],
    },
  );

export type PayoutScheduleInput = z.infer<typeof payoutScheduleSchema>;
