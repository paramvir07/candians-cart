import { model, models, Schema, Document, Types } from "mongoose";

export interface IStorePayout {
  startDate: Date;
  endDate: Date;
  storeId: Types.ObjectId;
  totalNumberofOrders: number;
  orderIds: Types.ObjectId[];
  totalCustomerPaid: number;
  totalGST: number;
  totalPST: number;
  totalTax: number;
  baseTax: number;
  markupTax: number;
  storebasetaxGST: number;
  storebasetaxPST: number;
  platformMarkuptax: number;
  totalSubsidy: number;
  totalDisposableFee: number;
  storeFixedValue: number;
  storeProfit: number;
  storePayout: number;
  totalWalletTopUpCashCollected: number;
  totalOrderCashCollected: number;
  totalCashCollected: number;
  platformProfit: number;
  platformCommision: number;
  status: "pending" | "paid";
  additionalNote?: string;
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
    platformMarkuptax: {
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
    totalOrderCashCollected: {
      type: Number,
      default: 0,
    },
    totalCashCollected: {
      type: Number,
      default: 0,
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
