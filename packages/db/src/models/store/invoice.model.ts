import { model, models, Schema } from "mongoose";

const ProductInvoiceSchema = new Schema(
  {
    // Image kit document id
    documentId: {
      type: {
        url: { type: String, required: true },
        fileId: { type: String, required: true },
      },
      required: true,
    },

    storeId: {
      //Refer to the _id store model
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        oldPrice: {
          type: Number, // In cents
          required: false, // False for brand new products
        },
        newPrice: {
          type: Number, // In cents
          required: true,
        },
        status: {
          type: String,
          enum: ["PENDING","APPROVED", "REJECTED"],
          default: "PENDING",
        },
      },
    ],

    additionalNote: {
      type: String,
      required: false,
    },
    // Name of product in invoice whose value is being changed
    productNameInInvoice: {
      type: String,
      required: false,
    },
    vendorName: {
      type: String,
      required: true,
      trim: true,
    },
    DateInvoiceCame: {
      type: Date,
      required: true,
    },
    InvoiceNumber: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

export default models.ProductInvoice ||
  model("ProductInvoice", ProductInvoiceSchema);
