import { model, Model, models, Schema } from "mongoose";

export interface ICloverConnection {
  environment: "sandbox" | "production";
  merchantId: string;
  accessTokenEncrypted: string;
  refreshTokenEncrypted: string;
  accessTokenExpiration: number;
  refreshTokenExpiration: number;
  connectedAt: Date;
  lastRefreshedAt?: Date;
}

const cloverConnectionSchema = new Schema<ICloverConnection>(
  {
    environment: {
      type: String,
      enum: ["sandbox", "production"],
      required: true,
      unique: true,
      index: true,
    },
    merchantId: {
      type: String,
      required: true,
      index: true,
    },
    accessTokenEncrypted: {
      type: String,
      required: true,
      select: false,
    },
    refreshTokenEncrypted: {
      type: String,
      required: true,
      select: false,
    },
    accessTokenExpiration: {
      type: Number,
      required: true,
    },
    refreshTokenExpiration: {
      type: Number,
      required: true,
    },
    connectedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    lastRefreshedAt: Date,
  },
  { timestamps: true },
);

export const CloverConnection: Model<ICloverConnection> =
  models.CloverConnection ||
  model<ICloverConnection>("CloverConnection", cloverConnectionSchema);
