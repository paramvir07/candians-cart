import { z } from "zod";

export const CustomerSchema = z.object({
  name: z.string().min(1, "Name is Required"),
  email: z.email("Invalid email address").transform((v) => v.trim().toLowerCase()),
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

  monthlyBudget: z.coerce
    .number()
    .min(300, "Monthly Budget should be more than or equal to 300"),
  associatedStore: z.string().min(1, "Store is Required"),
  referralCode: z
    .string()
    .min(10, "Code must be at least 10 characters")
    .max(12, "Code must be at most 12 characters")
    .transform((v) => v.trim().toUpperCase()),
});

export const editProfileSchema = CustomerSchema.pick({
  name: true,
  address: true,
  city: true,
  province: true,
  mobile: true,
});
