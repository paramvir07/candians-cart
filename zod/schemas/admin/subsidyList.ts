
import { categories } from "@/lib/categories";
import { z } from "zod";

export const createSubsidyListItemSchema = z.object({
  name: z.string().min(1, "Product name cannot be empty"),
  category: z.enum(categories),
});

export const updateSubsidyListItemSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  category: z.enum(categories),
});
