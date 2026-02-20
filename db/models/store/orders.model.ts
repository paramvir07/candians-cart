import { model, models, Schema } from "mongoose";

const orderSchema = new Schema(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    products: [
      {
        _id: false,
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number, // in cents
          required: true,
        },
      },
    ],
    location: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number, // in cents
      required: true,
    },
    tax: {
      type: Number, // in cents
      default: 0,
    },

    paymentType: {
      type: String,
      enum: ["card", "cash"],
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "completed",
        "canceled",
        "refund requested",
        "refunded",
        "refund rejected",
        "failed",
      ],
      default: "pending",
      required: true,
      index: true,
    },

    locked: {
      type: Boolean,
      default: false,
    },
    handledBy: {
      // the name of the person who handled the order payment
      type: String,
      required: false,
    },
  },
  { timestamps: true },
);

export default models.Order || model("Order", orderSchema);
