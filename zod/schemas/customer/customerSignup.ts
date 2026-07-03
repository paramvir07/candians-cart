import { HEARD_ABOUT_US_VALUES } from "@/lib/customer/heardAboutUs";
import { CUSTOMER_PROVINCE } from "@/lib/customer/location";
import { validateBCAddress } from "@/lib/google/addressValidation";
import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/^\S+$/, "Password cannot contain spaces")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^a-zA-Z0-9\s]/, "Must contain at least one special character");

export const getPasswordChecks = (password: string) => [
  {
    label: "At least 8 characters",
    valid: password.length >= 8,
  },
  {
    label: "No spaces",
    valid: password.length > 0 && !/\s/.test(password),
  },
  {
    label: "One lowercase letter",
    valid: /[a-z]/.test(password),
  },
  {
    label: "One uppercase letter",
    valid: /[A-Z]/.test(password),
  },
  {
    label: "One number",
    valid: /[0-9]/.test(password),
  },
  {
    label: "One special character",
    valid: /[^a-zA-Z0-9\s]/.test(password),
  },
];

export const toTitleCase = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const aptUnitSchema = z
  .string()
  .trim()
  .max(30, "Apt / Unit must be 30 characters or less")
  .regex(
    /^[a-zA-Z0-9\s#\-\/.]+$/,
    "Apt / Unit can only contain letters, numbers, spaces, #, -, /, or .",
  )
  .optional()
  .or(z.literal(""))
  .transform((v) => {
    if (!v) return "";

    return v.trim().replace(/\s+/g, " ");
  });

const baseCustomerObject = z.object({
  name: z.string().trim().min(1, "Name is Required").transform(toTitleCase),

  email: z
    .email("Invalid email address")
    .transform((v) => v.trim().toLowerCase()),

  password: passwordSchema,

  aptUnit: aptUnitSchema,

  address: z
    .string()
    .trim()
    .min(1, "Please select your address from the dropdown"),

  city: z.string().trim().min(1, "City is required").transform(toTitleCase),

  province: z.literal(CUSTOMER_PROVINCE, {
    message: "We currently only deliver within British Columbia",
  }),

  postalCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^V\d[A-Z]\s?\d[A-Z]\d$/,
      "Please enter a valid BC postal code (e.g. V2S 3K1)",
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

function withAddressValidation<T extends z.ZodObject<any>>(schema: T) {
  return schema.superRefine(async (data: any, ctx) => {
    // Let field-level errors surface first
    if (!data.address || !data.city || !data.postalCode) return;

    const result = await validateBCAddress(
      data.address,
      data.city,
      data.postalCode,
    );

    if (!result.valid) {
      ctx.addIssue({
        code: "custom",
        path: ["address"],
        message: result.reason ?? "Please enter a valid BC address",
      });
    }
  });
}

export const CustomerSchema = withAddressValidation(baseCustomerObject);

export const editProfileSchema = withAddressValidation(
  baseCustomerObject.pick({
    name: true,
    address: true,
    aptUnit: true,
    city: true,
    province: true,
    postalCode: true,
  }),
);
