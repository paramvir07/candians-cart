# Caching & Search Strategy (MongoDB Atlas & Next.js Caching)

This document outlines how **Candian Cart** handles heavy database queries, optimizes response times, and prevents server crashes using a combination of MongoDB Atlas Search and Next.js caching mechanisms.

## 1. Dual-Layer Caching Architecture

To protect our MongoDB database from unnecessary reads and speed up the user experience, we employ a strict two-tier caching strategy.

### Tier 1: Per-Request Deduplication (`React.cache`)
During a single server render cycle, multiple React Server Components might request the same user profile or store settings. We wrap these DB calls in React's `cache` to ensure the database is only hit *once* per request, no matter how many times the function is invoked.

```ts
// actions/cache/user.cache.ts (Conceptual Usage based on existing patterns)
import { cache as reactCache } from "react";
import Customer from "@/db/models/customer/customer.model";
import mongoose from "mongoose";

export const getCustomerProfile = reactCache(async (userId: string) => {
  await dbConnect();
  return await Customer.findOne({
    userId: new mongoose.Types.ObjectId(userId),
  }).lean(); // Always use .lean() for read-only queries!
});
```

### Tier 2: Global Cross-Request Caching (`unstable_cache`)
For expensive aggregations or catalog queries that are identical across different users (like searching for a specific product in a specific store), we cache the results globally using Next.js `unstable_cache`. 

**Rule:** Always include `tags` so that mutations (like `createProduct`) can trigger `revalidateTag('products')` to clear the stale cache globally.

```ts
// actions/cache/product.cache.ts
import { unstable_cache } from "next/cache";

export const getCachedProducts = (query: string, storeId?: string) =>
  unstable_cache(
    async () => {
      // Database logic here...
    },
    // Unique cache key based on inputs
    [`product-search-${query}-${storeId}`], 
    { 
      revalidate: 3600, // Background refresh every 1 hour
      tags: ["products"] // Crucial for on-demand invalidation
    },
  )();
```

## 2. MongoDB Atlas Fuzzy Search

We use MongoDB Atlas Search (not standard Regex) for intelligent, typo-tolerant search across products and stores. 

### Compound Queries (Text vs. UPC)
Our `$search` pipeline intelligently handles both text queries and barcode scans (UPCs). If the user types a number, it performs an exact match on the `primaryUPC`. Otherwise, it performs a fuzzy text search on the name, description, and category.

```ts
// actions/common/searchProducts.action.ts

// 1. Determine if the query is a barcode/UPC
const parsedNumber = Number(cleanQuery);
const isNumeric = !isNaN(parsedNumber) && cleanQuery !== "";

const shouldClauses: any[] = [
  {
    text: {
      query: cleanQuery,
      path: ["name", "description", "category"],
      fuzzy: { maxEdits: 2, prefixLength: 1, maxExpansions: 50 },
    },
  },
];

// 2. Add exact UPC match if numeric
if (isNumeric) {
  shouldClauses.push({
    equals: { path: "primaryUPC", value: parsedNumber },
  });
}

// 3. Execute Compound Pipeline
const pipeline: PipelineStage[] = [
  {
    $search: {
      index: "ProductSearch",
      compound: {
        should: shouldClauses,
        minimumShouldMatch: 1,
      },
    },
  },
];
```

### Anti-Pagination Rule for Search Performance
Deep pagination (`$skip`) is explicitly **avoided** for fuzzy searches. Skipping 100 documents forces MongoDB to score and sort all 100 documents before throwing them away, causing severe CPU spikes. 

**Rule:** Fuzzy search results are always strictly capped.

```ts
// Return only the top 20 most relevant matches
pipeline.push({ $limit: 20 });
```

## 3. Memory Leak Prevention (The 50-Item Cap)

When a user opens a store or views a product list without providing a search query, a "fallback" query is executed to return the default catalog.

If a store grows to 5,000 products, running `Product.find({}).lean()` will pull all 5,000 JSON objects into the Next.js Node server's RAM at once. Doing this concurrently across multiple users will result in an **Out-Of-Memory (OOM) Server Crash**.

**Rule:** ALL fallback queries must be capped to protect server memory. 

```ts
// actions/common/searchProducts.action.ts & searchStore.action.ts

// Fallback for no query: return all products safely
const findQuery = storeId
  ? { storeId: new mongoose.Types.ObjectId(storeId) }
  : {};

// CRITICAL: .limit(50) prevents massive RAM consumption
return await Product.find(findQuery).limit(50).lean();
```