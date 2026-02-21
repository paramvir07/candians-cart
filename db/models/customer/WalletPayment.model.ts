import { Model, Schema, Types, model, models } from "mongoose";


export interface IWalletPayment {
  userId: Types.ObjectId;
  stripeEventId: string;
  checkoutSessionId: string;
  paymentIntentId: string;
  amount: number; 
  currency: string;
  status: string; 
}

const WalletPaymentSchema = new Schema<IWalletPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    stripeEventId: {
      type: String,
      required: true,
      unique: true,
    },
    checkoutSessionId: { type: String, required: true },
    paymentIntentId: { type: String, required:true },
    amount: { type: Number, required: true }, 
    currency: { type: String, default: "cad" },
    status: { type: String, required: true }, 
  },
  { timestamps: true }
);
const WalletPayment: Model<IWalletPayment> = models.WalletPayment || model<IWalletPayment>("WalletPayment", WalletPaymentSchema);

export default WalletPayment;