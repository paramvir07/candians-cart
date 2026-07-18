import { IReferralCode } from "@canadian-cart/db/models/admin/referralCode.model";
import { Types } from "mongoose";

export type ReferralCode = IReferralCode & {
  _id: Types.ObjectId;
};
