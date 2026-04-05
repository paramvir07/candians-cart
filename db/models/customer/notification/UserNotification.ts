import { Schema, Model, model, models, Types } from "mongoose";

export interface INotificationUser {
  notificationId: Types.ObjectId;
  customerId: Types.ObjectId;
  status: string;
}

// this is many to many relationship btw notification (both global and private) and if the user has read the message
const notificationUserSchema = new Schema<INotificationUser>({
  notificationId: {
    type: Schema.Types.ObjectId,
    ref: "Notification",
    required: true,
    index: true,
  },
  customerId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ["READ", "UNREAD"],
    default: "READ",
    required: true,
  },
});

const NotificationUser: Model<INotificationUser> =
  models.NotificationUser ||
  model<INotificationUser>("NotificationUser", notificationUserSchema);

export default NotificationUser;
