# Indexing

## Product Indexing

Keep the name of the index as `ProductSearch` and then use the following data to fuzzy search against

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "name": {
        "type": "string",
        "analyzer": "lucene.standard"
      },
      "description": {
        "type": "string",
        "analyzer": "lucene.standard"
      },
      "category": {
        "type": "string",
        "analyzer": "lucene.standard"
      },
      "primaryUPC": {
        "type": "number"
      }
    }
  }
}
```

Used in `searchProducts.action.ts`

# FilterQuery is Replaced with QueryFilter (Using mongo 9.x.x)

```ts
import type { QueryFilter } from "mongoose";

// usage
const query: QueryFilter<typeof Product> = {
  // code
};
```

# Fuzzy search and results

Fuzzy search is done in the file `searchProducts.actions.ts`, it pushes top 20 most relevant searches.

```ts
pipeline.push({ $limit: 20 });
```