import { z } from "zod"

export const storeSignupSchema = z.object({
  name: z.string().min(1, "Store Name is Required"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  address: z.string().min(1, "Address is required"),
  mobile: z.string().length(10, "Mobile number must be exactly 10 digits"),
});
