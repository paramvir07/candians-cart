import { z } from "zod";

export const validateReferralCodeSchema = z.object({
  code: z
    .string()
    .min(10, "Code must be at least 10 characters")
    .max(12, "Code must be at most 12 characters")
    .transform((v) => v.trim().toUpperCase()),
});
