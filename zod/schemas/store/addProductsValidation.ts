import { z } from "zod";

export const ALLOWED_TAX_RATES = [0, 5, 7, 12] as const; //percentages

export const ProductFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Product name must be at least 3 characters long")
    .max(100, "Product name must be less than 100 characters long"),

  description: z
    .string()
    .trim(),

  category: z.enum(
    [
      "Fruits",
      "Vegetables",
      "Dairy",
      "Meat",
      "Bakery",
      "Beverages",
      "Snacks",
      "Household",
      "Personal Care",
      "Other",
    ],
    { message: "Invalid category selected" },
  ),

  markup: z.number().min(0, "Markup must be a positive number").max(30, "Markup cannot exceed 30%"),

  tax: z
    .number()
    .int() //Should be removed??
    .refine(
      (val: number) => (ALLOWED_TAX_RATES as readonly number[]).includes(val),
      {
        message: "Invalid tax rate selected",
      },
    ),

  disposableFee: z.number().min(0, "Fee cannot be negative").default(0),

  price: z.number().min(0.01, "Price must be at least 0.01"),

  stock: z.boolean(),

  images: z
    .array(
      z.object({
        url: z.string().url("Invalid image URL"),
        fileId: z.string(),
      }),
    )
    .optional()
    .default([]), // For the time being this is optional, have to integrate Imagekit
});

export type ProductFormValues = z.infer<typeof ProductFormSchema>;
