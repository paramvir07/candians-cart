import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";

const MONGODB_URI = process.env.MONGODB_URI;
const client = new MongoClient(MONGODB_URI as string);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()],
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
      },

      //customer and store both's required data
      address: {
        type: "string",
        required: false,
      },
      mobile: {
        type: "string",
        required: false,
      },
      city: {
        type: "string",
        required: false,
      },
      province: {
        type: "string",
        required: false,
      },

      //customer's required data
      hasCar: {
        type: "boolean",
        required: false,
      },
      referalCode: {
        type: "string",
        required: false,
      },
      referredBy: {
        type: "string",
        required: false,
      },

      //store's required data
      storeName: {
        type: "string",
        required: false,
      },
    },
  },
});
