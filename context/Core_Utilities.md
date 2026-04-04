# Core Utilities & Developer Ergonomics (Auth, Errors, Roles)

This document outlines the foundational utilities for validation, session handling, and role-based access in **Candian Cart**. These patterns are standardized across the app to reduce boilerplate, ensure type safety, and prevent redundant security checks.

## 1. Automated Session Handling (`getUserSession`)

The `getUserSession` utility is designed to handle missing sessions automatically. When invoked in a Server Action or Route Handler, it guarantees that a valid session is returned. If a user is not authenticated, it throws an error or automatically redirects them to the login page.

**Rule:** Do *not* write manual `if (!session)` or `if (!session.user)` checks after calling this function.

```ts
// actions/auth/getUserSession.actions.ts (Conceptual Usage)
import { getUserSession } from "@/actions/auth/getUserSession.actions";

export const performSecureAction = async () => {
  // Automatically halts execution and redirects if unauthenticated
  const session = await getUserSession(); 
  
  const { id: userId, role } = session.user;
  
  // Proceed with secure logic...
};
```

## 2. Standardized Error Handling (`zodErrorResponse`)

All complex Server Actions and Client Forms use `Zod` for payload validation. To handle deep, nested Zod error objects, we use a global utility `zodErrorResponse` to parse these errors into a clean, readable string suitable for UI toasts (like `sonner`).

```ts
// zod/validation/error.ts (Conceptual Usage)
import { createProductFormSchema } from "@/zod/schemas/store/addProductsValidation";
import { zodErrorResponse } from "@/zod/validation/error";
import { toast } from "sonner";

// Inside a client component or server action:
const schema = createProductFormSchema(role);
const validationResult = schema.safeParse(rawpayload);

if (!validationResult.success) {
  // Automatically formats deep Zod issues into a single readable string
  toast.error(`Validation Error: ${zodErrorResponse(validationResult)}`);
  return;
}

const validPayload = validationResult.data;
```

## 3. Implicit Role-Based Access (`lib/auth/roles.ts`)

Candian Cart operates on a strict multi-tenant role system: `admin`, `store`, `cashier`, and `customer`. 

Role enforcement is handled *implicitly* at the query level to prevent data leaks. Instead of just returning unauthorized errors, the system actively overrides query targets based on the user's role.

```ts
// Example: Query enforcement based on role
const session = await getUserSession();
const { id: userId, role } = session.user;

let targetStoreId = providedStoreId;

// Enforcement Rule: Customers MUST only see their associated store
if (role === "customer") {
  const customer = await getCustomerProfile(userId);
  if (!customer?.associatedStoreId) {
    return { success: false, error: "Associated store not found for customer." };
  }
  // Hard override: Ignore what the client requested, strictly use the DB truth
  targetStoreId = customer.associatedStoreId.toString();
}
```

## 4. Strict Type Separation: DB vs. Client (`products.types.ts`)

To prevent Next.js Server Component serialization crashes (React cannot pass MongoDB objects or classes directly to Client Components), we maintain a strict separation between Raw DB Documents and Client Payloads.

**Rule:** `IProductDB` is strictly for backend logic. `IProduct` is the serialized version sent to the frontend. Note how `Types.ObjectId` maps to `string`.

```ts
// types/store/products.types.ts
import { Types } from "mongoose";

// Interface for the Server/DB (Raw Mongoose Documents)
export interface IProductDB {
  _id: Types.ObjectId;
  storeId: Types.ObjectId;
  name: string;
  stock: boolean;
  price: number;
  InvoiceId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for the Frontend (Serialized data coming from Server Action)
export interface IProduct {
  _id: string;          // Serialized ObjectId
  storeId: string;      // Serialized ObjectId
  name: string;
  stock: boolean;
  price: number;        // Stored in cents
  InvoiceId: string;    // Serialized ObjectId
  createdAt: string;    // ISO Date string
  updatedAt: string;    // ISO Date string
}
```

### JSON Serialization for Safe Transfer

When sending data from a Server Action to a Client Component, it is mandatory to serialize the payload safely using standard JSON parsing.

```ts
// Safe transfer method
const products = await Product.find(findQuery).lean();

return {
  success: true,
  // Serializes ObjectIds and Dates to primitive strings safely
  data: JSON.parse(JSON.stringify(products)),
};
```