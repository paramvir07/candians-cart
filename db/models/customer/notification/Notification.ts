import mongoose, { Schema, Model, model, models, Types } from "mongoose";

export interface INotification {
  title: string;
  message: string;
  type: string;
  createdBy?: Types.ObjectId;
  targetCustomer?: Types.ObjectId;
  systemGenerated: boolean;
}

// for sending notifications (both global and private) to customers
const notificationSchema = new Schema<INotification>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: false,
    },
    type: {
      type: String,
      enum: ["GLOBAL", "PRIVATE"],
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    targetCustomer: {
      type: Schema.Types.ObjectId,
      required: false,
      index: true,
    },
    systemGenerated: {
      type: Boolean,
      required: false,
    }
  },
  { timestamps: true },
);

const Notification: Model<INotification> =
  models.Notification ||
  model<INotification>("Notification", notificationSchema);

export default Notification;
