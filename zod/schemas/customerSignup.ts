import { z } from "zod";
const currentYear = new Date().getFullYear();

export const customerSignupSchema = z.object({
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
  hasCar: z.coerce.boolean(),
   carModel: z
    .string()
    .trim()
    .min(1, "Car model is required")
    .optional(),

  carYear: z
    .coerce
    .number("Car year is required",
    )
    .int("Year must be a whole number")
    .min(1980, "Year must be 1980 or later")
    .max(currentYear, `Year must be ${currentYear} or earlier`)
    .optional(),

});
