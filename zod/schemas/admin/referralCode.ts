import { z } from "zod";

export const createReferralCodeSchema = z.object({
  code: z
    .string()
    .min(10, "Code must be at least 10 characters")
    .max(12, "Code must be at most 12 characters")
    .transform((v) => v.trim().toUpperCase()),

  maxUses: z
    .union([z.string().trim(), z.number()])
    .optional()
    .transform((v) => {
      if (v === undefined) return null;
      const s = String(v).trim();
      if (s === "") return null; // unlimited
      const n = Number(s);
      if (!Number.isFinite(n) || n <= 0) return null;
      return n;
    }),

  expiresAt: z
    .string()
    .optional()
    .transform((v) => {
      if (!v || v.trim() === "") return null;
      const d = new Date(v + "T23:59:59.999Z");
      return isNaN(d.getTime()) ? null : d;
    }),

  isActive: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((v) => {
      if (typeof v === "boolean") return v;
      if (typeof v === "string") return v === "on" || v === "true";
      return false; // if undefined → OFF
    }),
});
