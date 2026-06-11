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
        "type": "string",
        "analyzer": "lucene.keyword"
      }
    }
  }
}
```

Changed PrimaryUPC to String

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

## Customer Searching

Customer search is done in the `getCustomers.action.ts`.

On MongoDB make a search vector with the following json and name the vecor as `CustomerSearch` -:

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "_id": {
        "type": "objectId"
      },
      "associatedStoreId": {
        "type": "objectId"
      },
      "name": [
        {
          "type": "string",
          "analyzer": "lucene.standard"
        },
        {
          "type": "autocomplete",
          "analyzer": "lucene.standard",
          "tokenization": "edgeGram",
          "minGrams": 2,
          "maxGrams": 20,
          "foldDiacritics": true
        }
      ],
      "email": [
        {
          "type": "string",
          "analyzer": "lucene.standard"
        },
        {
          "type": "autocomplete",
          "analyzer": "lucene.standard",
          "tokenization": "edgeGram",
          "minGrams": 3,
          "maxGrams": 30,
          "foldDiacritics": true
        }
      ],
      "mobile": {
        "type": "string",
        "analyzer": "lucene.standard"
      }
    }
  }
}
```

For Scanning Id, we just look up with ID.
