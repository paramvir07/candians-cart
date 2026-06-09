# Miscellaneous Architecture Patterns & Conventions

This final document covers the overarching structural patterns, naming conventions, and UI standards that keep the **Candian's Cart** codebase predictable and scalable. While these don't fit into a single feature pipeline, they govern how the entire application is organized.

## 1. Client vs. Server Component Boundaries (`*Client.tsx`)

Candian's Cart heavily leverages the Next.js App Router paradigm. To optimize SEO, initial load times, and database security, data fetching happens on the Server, while interactivity happens on the Client.

To manage this cleanly, we use the **"Client Wrapper" Pattern**. Page files (`page.tsx`) are strictly Server Components that fetch data and handle auth. They then pass serialized data down to a dedicated client component, usually suffixed with `*Client.tsx`.

```tsx
// app/store/(store)/analytics/page.tsx (Server Component)
import { getStoreAnalytics } from "@/actions/store/getStoreAnalytics.action";
import StoreAnalyticsClient from "@/components/store/StoreAnalyticsClient";
import { getUserSession } from "@/actions/auth/getUserSession.actions";

export default async function AnalyticsPage() {
  const session = await getUserSession();
  const rawData = await getStoreAnalytics(session.user.associatedStoreId);

  // Serialize complex DB objects to JSON before passing across the boundary
  const serializedData = JSON.parse(JSON.stringify(rawData));

  return <StoreAnalyticsClient initialData={serializedData} />;
}
```

## 2. File Naming Conventions

To make the codebase instantly navigable for developers and AI agents, file extensions are used to explicitly declare a file's purpose and execution environment.

- **`.model.ts`** (e.g., `products.model.ts`): Defines Mongoose database schemas. These should _never_ be imported into a Client Component.
- **`.action.ts`** / **`.actions.ts`** (e.g., `searchProducts.action.ts`): Contains Next.js Server Actions (denoted by `"use server";` at the top). These are asynchronous functions that mutate or fetch data and can be called directly from Client Components.
- **`.cache.ts`** (e.g., `product.cache.ts`): Contains `unstable_cache` or `React.cache` wrappers for heavy database queries.
- **`[ID]` Folders** (e.g., `[productId]`): Used in the `app` directory for dynamic route segments.

## 3. Standardized UI & Feedback Loop

Candian's Cart relies on a consistent set of tools for its user interface to avoid CSS bloat and maintain a unified design system.

- **UI Components**: Built using **shadcn/ui** (Tailwind CSS + Radix UI primitives). Found in `components/ui/*`.
- **Icons**: **Lucide React** is the standard icon library. Avoid importing SVGs manually if a Lucide icon exists.
- **User Feedback (Toasts)**: **Sonner** is used for all success/error notifications. It is integrated deeply into the Server Action pipeline (via the `zodErrorResponse` utility).

```tsx
// Example of standard UI usage in a Client Component
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { toast } from "sonner";

const handleSave = async () => {
  const result = await someServerAction();
  if (result.success) {
    toast.success("Settings updated successfully!");
  } else {
    toast.error(result.error || "Failed to update settings.");
  }
};
```

## 4. Third-Party Integrations Abstraction

External services are abstracted into the `lib/` directory or dedicated Route Handlers to keep business logic clean.

- **`lib/stripe.ts`**: Initializes the Stripe backend SDK. Should only be called from Server Actions or API routes.
- **`lib/auth/email.ts`** (using Resend): Centralized templates for sending transactional emails (e.g., Help Forms, OTPs).
- **`/app/imagekit/route.ts`**: The sole gateway for asset uploads. Client components send `FormData` here rather than talking to ImageKit directly, keeping API keys securely on the server.
