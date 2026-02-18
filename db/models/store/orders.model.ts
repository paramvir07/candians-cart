import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "storeInfo",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customerinfor",
      required: true,
      index: true,
    },
    products: [
      {
        _id: false,
        productId: {
          type: mongoose.Schema.Types.ObjectId,
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
    handledBy: {   // the name of the person who handled the order payment
      type: String,
      required: false,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);