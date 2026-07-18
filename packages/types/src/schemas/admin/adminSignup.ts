import { z } from "zod"

export const adminSignupSchema = z.object({
  name: z.string().min(1, "Name is Required"),
  email: z.email("Invalid email address").transform((v) => v.trim().toLowerCase()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character"),
});
