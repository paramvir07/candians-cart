import { model, models, Schema } from "mongoose";

const productSchema = new Schema(
  {
    storeId: {
      //Refer to the _id store model
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
    },

    category: {
      type: String,
      enum: [
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
      required: true,
    },

    markup: {
      type: Number, // percentage markup for the product for 30 % (stored as 30)
      required: true,
    },

    tax: {
      type: Number, // percentage tax for the product (5 % becomes 0.05)
      enum: [0.0, 0.05, 0.07, 0.12], // no tax, GST 5%, PST 7%, GST+PST 12%
      required: true,
    },

    disposableFee: {
      type: Number, // in cents (0.10 becomes 10)
      required: false, // milk carten disposdable fee, for example 10 cents
    },

    price: {
      type: Number, // in cents
      required: true,
    },

    stock: {
      // Changed it to boolean since we are not storing the quantity of products, we are just storing whether the product is in stock or not.
      type: Boolean,
      default: true,
      required: true,
    },

    subsidised: {
      type: Boolean,
      default: false,
    },

    images: {
      type: [
        {
          url: { type: String, required: true },
          fileId: { type: String, required: true },
        },
      ],
      required: false, // For the time being this is false, have to integrate Imagekit
    },

    isFeatured: {
      type: Boolean,
      default: false,
      required: true,
    },

    // This is the invoice Id, have to keep this required false because otherwise the admin validation will fail
    InvoiceId: {
      type: Schema.Types.ObjectId,
      ref: "ProductInvoice",
      required: false,
    },

    primaryUPC: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

export default models.Product || model("Product", productSchema);
