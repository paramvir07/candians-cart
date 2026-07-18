import { z } from "zod";

// Direct path referencing during your migration slice step
import { CashierCreateProductSchema } from "@/zod/schemas/cashier/cashierProductSchema";
import { createProductFormSchema } from "@/zod/schemas/store/addProductsValidation";

export const ProductFormSchema = CashierCreateProductSchema;
export type ProductFormValues = z.infer<typeof CashierCreateProductSchema>;

export const StoreProductSchema = createProductFormSchema;
export type StoreProductValues = z.infer<typeof createProductFormSchema>;

export interface SharedUserSession {
  userId: string;
  role: "admin" | "store" | "immigration" | "cashier" | "customer";
}