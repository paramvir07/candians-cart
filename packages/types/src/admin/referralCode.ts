import { Types } from "mongoose";

export interface IReferralCode {
  code: string;
  maxUses?: number | null; // null = unlimited
  expiresAt?: Date | null; // null = never expires
  isActive: boolean;
  uses: number; // track usage count
  customerId?: Types.ObjectId;
  type: "admin" | "customer";
  createdAt: Date;
  updatedAt: Date;
}

export type ReferralCode = IReferralCode & {
  _id: Types.ObjectId;
};