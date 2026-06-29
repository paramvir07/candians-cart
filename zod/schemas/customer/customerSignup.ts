import { HEARD_ABOUT_US_VALUES } from "@/lib/customer/heardAboutUs";
import { CUSTOMER_CITIES, CUSTOMER_PROVINCES } from "@/lib/customer/location";
import { z } from "zod";

export const toTitleCase = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const CustomerSchema = z.object({
  name: z.string().trim().min(1, "Name is Required").transform(toTitleCase),

  email: z
    .email("Invalid email address")
    .transform((v) => v.trim().toLowerCase()),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character"),

  address: z.string().trim().min(1, "Address is required"),

  city: z.enum(CUSTOMER_CITIES, {
    message: "Invalid city selected",
  }),

  province: z.enum(CUSTOMER_PROVINCES, {
    message: "Province must be BC",
  }),

  postalCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/,
      "Please enter a valid Canadian postal code",
    )
    .transform((v) => {
      const cleaned = v.replace(/\s/g, "");
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    }),

  heardAboutUs: z.enum(HEARD_ABOUT_US_VALUES, {
    message: "Please select where you heard about us",
  }),

  monthlyBudget: z.coerce
    .number()
    .min(300, "Monthly Budget should be more than or equal to 300"),

  associatedStore: z.string().min(1, "Store is Required"),

  referralCode: z
    .string()
    .min(8, "Code must be at least 8 characters")
    .max(12, "Code must be at most 12 characters")
    .transform((v) => v.trim().toUpperCase()),
});

export const editProfileSchema = CustomerSchema.pick({
  name: true,
  address: true,
  city: true,
  province: true,
  postalCode: true,
});
