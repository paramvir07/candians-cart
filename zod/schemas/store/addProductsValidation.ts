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
      "Oil & Ghee",
      "Pulses & Lentils",
      "Flour & Atta",
      "Rice",
      "Spices",
      "Pickles & Chutneys",
      "Instant Foods",
      "Frozen Foods",
      "Sweets & Mithai",
      "Dry Fruits & Nuts",
      "Tea & Coffee",
      "Sauces & Condiments",
      "Papad & Fryums",
      "Pooja / Religious Items",
      "Utensils",
      "Disposables",
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
  markup: z
    .number()
    .min(30, "Markup must be between 30% and 35%")
    .max(35, "Markup cannot exceed 35%"),

});

export const createProductFormSchema = (role: "admin" | "store") => {
  return BaseProductFormSchema.extend({
    InvoiceId:
      role === "store"
        ? z
            .string()
            .trim()
            .regex(/^[0-9a-fA-F]{24}$/, {
              message: "Invoice ID is required and must be valid",
            }) // Required for Store
        : z
            .string()
            .trim()
            .optional() // Allows undefined
            .refine((val) => !val || /^[0-9a-fA-F]{24}$/.test(val), {
              message: "Invalid Invoice ID format",
            }), // For Admin: Allows empty string OR a valid 24-char ObjectId
  });

  // have to make invoice optional for admin
};

export type ProductFormValues = z.infer<
  ReturnType<typeof createProductFormSchema>
>;
