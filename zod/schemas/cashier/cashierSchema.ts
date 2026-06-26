import { z } from "zod";
import { storeSignupSchema } from "../store/storeSignup";
import { toTitleCase } from "../customer/customerSignup";

export const cashierSchema = storeSignupSchema.extend({
  name: z
    .string()
    .trim()
    .min(1, "Cashier Name is Required")
    .transform(toTitleCase),
  associatedStore: z.string().min(1, "Please select a store."),
});
