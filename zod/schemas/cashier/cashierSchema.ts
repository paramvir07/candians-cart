import { z } from "zod";
import { storeSignupSchema } from "../store/storeSignup";

export const cashierSchema = storeSignupSchema.extend({
  name: z.string().min(1, "Cashier Name is Required."),
  associatedStore: z.string().min(1, "Please select a store."),
});