import { Model, Schema, model, models } from "mongoose";

export type ContactTopic =
  | "General Inquiry"
  | "Savings & Pricing"
  | "Gift Wallet & Rewards"
  | "Technical Support"
  | "Partnership"
  | "Other";

export interface IContact {
  name: string;
  email: string;
  phone?: string;
  topic: ContactTopic;
  message: string;
  accepted: boolean;
  resolved: boolean;
}

const ContactSchema = new Schema<IContact>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    topic: {
      type: String,
      enum: [
        "General Inquiry",
        "Savings & Pricing",
        "Gift Wallet & Rewards",
        "Technical Support",
        "Partnership",
        "Other",
      ],
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },
    accepted: {
      type: Boolean,
      default: false,
      required: true,
    },
    resolved: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ContactModel: Model<IContact> =
  models.Contact || model<IContact>("Contact", ContactSchema);

export default ContactModel;