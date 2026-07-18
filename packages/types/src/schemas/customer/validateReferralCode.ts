import { z } from "zod";

export const validateReferralCodeSchema = z.object({
  code: z
    .string()
    .min(8, "Code must be at least 8 characters")
    .max(12, "Code must be at most 12 characters")
    .transform((v) => v.trim().toUpperCase()),
});
