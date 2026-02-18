import { z } from "zod";

export const orderFormSchema = z.object({
  location: z.string().min(1, "Location is required"),
  paymentTypes: z.enum(["card", "cash"]),
  status: z.enum(["pending", "completed", "canceled"]), // Taking thesxe 3 enums for now

  products: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
    }),
  ),
});
