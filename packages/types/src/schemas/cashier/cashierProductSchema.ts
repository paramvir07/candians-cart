import z from "zod";

export const CashierCreateProductSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters").max(100),
  description: z.string().trim().optional().default(""),
  category: z.string().min(1, "Category is required"),
  markup: z.number().min(0, "Markup must be 0 or greater"),
  tax: z.number().refine((v) => [0, 0.05, 0.07, 0.12].includes(v), {
    message: "Invalid tax rate — must be 0, 0.05, 0.07, or 0.12",
  }),
  disposableFee: z.number().min(0).default(0),
  price: z.number().min(1, "Price must be greater than zero"),
  stock: z.boolean(),
  subsidised: z.boolean(),
  isFeatured: z.boolean(),
  isMeasuredInWeight: z.boolean().default(false),
  UOM: z
    .enum(["lb", "kg"], { message: 'UOM must be "lb" or "kg"' })
    .optional(),
  PriceDrop: z.boolean().default(false),
  primaryUPC: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9-]*$/, "UPC may only contain letters, numbers, and hyphens")
    .max(18, "UPC must be 18 characters or fewer")
    .transform((val) => (val === "" ? undefined : val.toUpperCase()))
    .optional(),
  images: z
    .array(z.object({ url: z.string(), fileId: z.string().optional() }))
    .optional()
    .default([]),
}).refine(
  (data) => !data.isMeasuredInWeight || !!data.UOM,
  { message: "Unit of measurement is required when measured by weight", path: ["UOM"] }
);

export type CashierCreateProductPayload = z.input<typeof CashierCreateProductSchema>;