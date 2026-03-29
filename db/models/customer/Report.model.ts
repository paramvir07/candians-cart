import { Model, Schema, model, models } from "mongoose";

export type ReportCategory = "bug" | "question" | "feature" | "other";

export interface IReport {
  email: string;
  subject: string;
  message: string;
  category: ReportCategory;
  accepted:boolean;
  resolved:boolean;
}

const ReportSchema = new Schema<IReport>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
    category: {
      type: String,
      enum: ["bug", "question", "feature", "other"],
      default: "question",
      required: true,
      index: true,
    },
    accepted:{
      type:Boolean,
      default:false,
      required:true
    },
    resolved:{
      type:Boolean,
      default:false,
      required:true
    }
  },
  {
    timestamps: true,
  }
);

const ReportModel: Model<IReport> =
  models.Report || model<IReport>("Report", ReportSchema);

export default ReportModel;