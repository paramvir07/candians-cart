# Complex Form Submission & UI Pipeline (Validation, Images, & Duplicates)

This document outlines how **Candian's Cart** handles complex data entry (like adding or editing products). Because product creation involves file uploads (images), complex types (numbers, booleans, ObjectIds), and database checks, we use a strict, phased pipeline.

This pipeline prevents "orphaned files" (uploading an image to ImageKit but the database save fails) and protects the user from losing their form state.

## The 4-Step Submission Pipeline

Every complex form submission must follow these four phases, explicitly separated in the code:

1. **Local Pre-Validation (Zod)**
2. **Database Checks (Duplicate Scanning)**
3. **Heavy Network Operations (Image Uploads)**
4. **Final Execution (Database Mutation)**

---

## 1. Zod Validation: The Gatekeeper (`addProductsValidation.ts`)

Before any network request is made, the raw string values from the React state must be validated and coerced into their proper types (e.g., converting a string `"5"` to the number `5`, checking UPC lengths).

We use extensible Zod schemas to handle role-based requirements. For example, Store owners _must_ provide an `InvoiceId`, while Admins can skip it.

```ts
// zod/schemas/store/addProductsValidation.ts
import { z } from "zod";

export const BaseProductFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Product name must be at least 3 characters long"),
  price: z.number().min(0.01, "Price must be at least 0.01"),
  stock: z.boolean(),
  // ... other base fields
});

// Role-aware schema extension
export const createProductFormSchema = (role: "admin" | "store") => {
  return BaseProductFormSchema.extend({
    InvoiceId:
      role === "store"
        ? z.string().regex(/^[0-9a-fA-F]{24}$/, "Invoice ID required")
        : z.string().optional(),
  });
};
```

## 2. Pre-Submit Duplicate Check (`ProductForm.tsx`)

Once the payload passes Zod validation, we do **not** upload the image yet. First, we query the database to see if the store is accidentally creating a duplicate product.

**Rule of Graceful UX:** If the fuzzy search finds a duplicate, we pause the submission and open a warning Dialog. The user can either cancel or click "Proceed Anyway". If the database search fails, we fail _open_ and allow the save to proceed so the store owner isn't blocked.

```tsx
// components/store/products/ProductForm.tsx (Step 1 of Submission)
const handlePreSubmitValidation = async () => {
  // 1. Zod Validation
  const validationResult = schema.safeParse(rawpayload);
  if (!validationResult.success) {
    toast.error(`Validation Error: ${zodErrorResponse(validationResult)}`);
    return;
  }

  setLoading(true);

  try {
    // 2. Duplicate Check using existing fuzzy search action
    const searchRes = await searchProducts(formData.name, storeId);

    if (searchRes.success && searchRes.data.length > 0) {
      setPotentialDuplicates(searchRes.data);
      setIsDuplicateModalOpen(true); // Open warning modal
      setLoading(false);
      return; // PAUSE submission here
    }
  } catch (err) {
    console.error("Check failed, proceeding anyway");
  }

  // If no duplicates, proceed to Execution
  await executeSubmit(validationResult.data);
};
```

## 3. Asset Uploads (`app/imagekit/route.ts`)

Only after the user has confirmed they want to proceed (bypassing the duplicate check) do we perform the heavy network operation of uploading the file to our CDN (ImageKit).

This guarantees that we do not upload junk files to ImageKit for products that get blocked by validation or cancelled by the user.

```tsx
// components/store/products/ProductForm.tsx (Step 2 of Submission - Execution)
const executeSubmit = async () => {
  setLoading(true);
  setIsDuplicateModalOpen(false);

  let finalImages = initialData?.images || [];

  // 3. Upload Image ONLY right before DB save
  if (imageFile) {
    const fd = new FormData();
    fd.append("file", imageFile);

    // Calls our Next.js Route Handler which securely talks to ImageKit
    const uploadRes = await fetch("/imagekit", { method: "POST", body: fd });
    const uploadData = await uploadRes.json();

    if (!uploadData.success) {
      toast.error("Failed to upload image");
      setLoading(false);
      return; // Halt if image upload fails
    }
    finalImages = uploadData.images;
  }

  // ... proceed to Step 4
```

## 4. Final Database Execution (`addProducts.ts`)

Finally, the fully validated payload (now containing the secure ImageKit CDN URLs) is passed to the Server Action to be saved in MongoDB.

```ts
// actions/store/products/addProducts.ts
"use server";

import Product from "@/db/models/store/products.model";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import { revalidateTag } from "next/cache";

export const createProduct = async (
  payload: ProductFormValues,
  providedStoreId?: string,
) => {
  try {
    const session = await getUserSession();

    // Securely determine store ID based on role
    const storeIdToUse =
      session.user.role === "store"
        ? session.user.associatedStoreId
        : providedStoreId;

    const newProduct = await Product.create({
      ...payload,
      storeId: storeIdToUse,
    });

    // Clear the global Next.js cache so the new product shows up in search immediately
    revalidateTag("products");

    return { success: true, data: JSON.parse(JSON.stringify(newProduct)) };
  } catch (error) {
    return { success: false, message: "Failed to create product in database." };
  }
};
```

### The UI Follow-Through

Once the Server Action returns `success: true`, the Client Component calls `router.push()` to send the user back to the product list, and `router.refresh()` to ensure the Next.js App Router fetches the newly updated layout.
