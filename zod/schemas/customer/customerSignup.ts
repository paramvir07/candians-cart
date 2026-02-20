import { z } from "zod";

const currentYear = new Date().getFullYear();

export const customerSignupSchema = z
  .object({
    name: z.string().min(1, "Name is Required"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character"),

    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    province: z.string().min(1, "Province is required"),
    mobile: z
      .string()
      .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),

    // ✅ accepts "true"/"false" and returns boolean
    hasCar: z.preprocess((v) => v === "true", z.boolean()),

    carModel: z.string().trim().optional(),
    carYear: z.coerce.number().optional(),

    monthlyBudget: z.coerce
      .number()
      .min(50, "Monthly Budget should be more than or equal to 50"),
    associatedStoreId: z.string().min(1, "Store is Required"),
    referralCode: z
      .string()
      .min(10, "Code must be at least 10 characters")
      .max(12, "Code must be at most 12 characters")
      .transform((v) => v.trim().toUpperCase()),
  })
  .superRefine((data, ctx) => {
    if (!data.hasCar) return;

    if (!data.carModel || data.carModel.trim().length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Car model is required",
        path: ["carModel"],
      });
    }

    if (data.carYear == null || !Number.isFinite(data.carYear)) {
      ctx.addIssue({
        code: "custom",
        message: "Car year is required",
        path: ["carYear"],
      });
    } else if (data.carYear < 1980 || data.carYear > currentYear) {
      ctx.addIssue({
        code: "custom",
        message: `Car year must be between 1980 and ${currentYear}`,
        path: ["carYear"],
      });
    }
  });
