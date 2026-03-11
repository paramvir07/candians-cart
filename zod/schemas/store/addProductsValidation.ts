import { z } from "zod";

export const ALLOWED_TAX_RATES = [0, 5, 7, 12] as const; //percentages

export const InvoiceFormSchema = z.object({
  vendorName: z.string().trim().min(2, "Vendor name is required"),
  invoiceNumber: z.number().min(1, "Invoice number is required"),
  dateInvoiceCame: z.coerce.date(),
  productNameInInvoice: z.string().optional(),
  additionalNote: z.string().optional(),
  document: z.object({
    url: z.url({ message: "Invalid invoice URL" }),
    fileId: z.string(),
  }),
});

export const BaseProductFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Product name must be at least 3 characters long")
    .max(100, "Product name must be less than 100 characters long"),

  description: z.string().trim(),

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

  tax: z
    .number()
    .int()
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
        url: z.url({ message: "Invalid image URL" }),
        fileId: z.string(),
      }),
    )
    .optional() // could be removed since default is empty
    .default([]), // For the time being this is optional, have to integrate Imagekit

  isFeatured: z.boolean(),
  InvoiceId: z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid Invoice ID format" }),
});

export const createProductFormSchema = (role: "Admin" | "Store") => {
  return BaseProductFormSchema.extend({
    markup:
      role === "Store"
        ? z
            .number()
            .min(30, "Markup must be between 30 and 35")
            .max(35, "Markup cannot excede 35%") // for store
        : z.number().min(0, "Markup cannot be negative"), // for admin
  });
};

export type ProductFormValues = z.infer<
  ReturnType<typeof createProductFormSchema>
>;
