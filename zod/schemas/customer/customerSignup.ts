import { z } from "zod";

const currentYear = new Date().getFullYear();

// 1. THE BASE SCHEMA: Pure object definitions. No .superRefine here.
const baseCustomerSchema = z.object({
  name: z.string().min(1, "Name is Required"),
  email: z.email("Invalid email address"),
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

  // UNIVERSAL PARSER: Accepts true (boolean), "true" (string), or "on"
  hasCar: z.preprocess(
    (v) => v === true || v === "true" || v === "on",
    z.boolean(),
  ),

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
});

// 2. THE LOGIC EXTRACTOR: We pull the car logic out so we can reuse it
const carValidationLogic = (
  data: { hasCar: boolean; carModel?: string; carYear?: number },
  ctx: z.RefinementCtx,
) => {
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
};

// 3. THE SIGNUP SCHEMA: We take the base, and add the refinement
export const customerSignupSchema =
  baseCustomerSchema.superRefine(carValidationLogic);

// 4. THE EDIT SCHEMA: We PICK from the clean base first, THEN add the refinement
export const editProfileSchema = baseCustomerSchema
  .pick({
    name: true,
    address: true,
    city: true,
    province: true,
    mobile: true,
    hasCar: true,
    carModel: true,
    carYear: true,
  })
  .superRefine(carValidationLogic);
