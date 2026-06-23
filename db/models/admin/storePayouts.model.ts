import { model, models, Schema, Document, Types } from "mongoose";

export interface IStorePayout {
  startDate: Date;
  endDate: Date;
  storeId: Types.ObjectId;
  totalNumberofOrders: number;
  totalPlatformFee: number;
  orderIds: Types.ObjectId[];
  totalCustomerPaid: number;
  totalBasePrice: number;
  totalGST: number;
  totalPST: number;
  totalTax: number;
  baseTax: number;
  markupTax: number;
  storebasetaxGST: number;
  storebasetaxPST: number;
  storeMarkupTax: number;
  totalSubsidy: number;
  totalDisposableFee: number;
  storeFixedValue: number;
  storeProfit: number;
  storePayout: number;
  totalWalletTopUpCashCollected: number;
  totalCashCollected: number;
  platformMarkupGSTTax: number;
  platformMarkupPSTTax: number;
  platformProfit: number;
  platformCommision: number;
  status: "pending" | "paid";
  additionalNote?: string;
  additionalCost?: number; // additional cost like image kit
  paymentReciept?: {
    url: string;
    fileId: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IStorePayoutDoc extends IStorePayout, Document {}

const StorePayoutSchema = new Schema<IStorePayoutDoc>(
  {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalNumberofOrders: {
      type: Number,
      required: true,
      default: 0,
    },
    totalPlatformFee: {
      type: Number,
      required: true,
    },
    orderIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    totalCustomerPaid: {
      type: Number,
      required: true,
    },
    // This is the total base price of all items sold, before any taxes, fees, or discounts
    totalBasePrice: {
      type: Number,
      required: true,
    },
    totalGST: {
      type: Number,
      required: true,
    },
    totalPST: {
      type: Number,
      required: true,
    },
    totalTax: {
      type: Number,
      required: true,
    },
    baseTax: {
      type: Number,
      required: true,
    },
    markupTax: {
      type: Number,
      required: true,
    },
    storebasetaxGST: {
      type: Number,
      required: true,
    },
    storebasetaxPST: {
      type: Number,
      required: true,
    },
    storeMarkupTax: {
      type: Number,
      required: true,
    },
    totalSubsidy: {
      type: Number,
      default: 0,
      required: true,
    },
    totalDisposableFee: {
      type: Number,
      required: true,
    },
    storeFixedValue: {
      type: Number,
      required: true,
    },
    storeProfit: {
      type: Number,
      required: true,
    },
    storePayout: {
      type: Number,
      required: true,
    },
    totalWalletTopUpCashCollected: {
      type: Number,
      default: 0,
    },
    totalCashCollected: {
      type: Number,
      default: 0,
    },
    platformMarkupGSTTax: {
      type: Number,
      required: true,
    },
    platformMarkupPSTTax: {
      type: Number,
      required: true,
    },
    platformProfit: {
      type: Number,
      required: true,
    },
    platformCommision: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    additionalNote: {
      type: String,
      required: false,
    },

    additionalCost: {
      type: Number, // in cents
      required: false,
    },

    // any proof of payment, Imagekit
    paymentReciept: {
      type: {
        url: { type: String, required: true },
        fileId: { type: String, required: true },
      },
      required: false,
    },
  },
  { timestamps: true },
);

export default models.StorePayout || model("StorePayout", StorePayoutSchema);
