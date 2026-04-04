import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Invalid email address").transform((v) => v.trim().toLowerCase()),
  password: z.string(),
  role: z.enum(["customer", "admin", "store", "cashier"]),
});
