import { z } from "zod"

export const adminSignupSchema = z.object({
  name: z.string().min(1, "Name is Required"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
