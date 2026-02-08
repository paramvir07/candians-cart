import { z } from "zod"

export const customerSignupSchema = z.object({
  name: z.string().min(1, "Name is Required"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  mobile: z.string().length(10, "Mobile number must be exactly 10 digits"),
  hasCar: z.coerce.boolean(),
});
