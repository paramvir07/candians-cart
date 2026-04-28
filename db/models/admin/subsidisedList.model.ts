import { categories } from "@/lib/categories";
import { model, Model, models, Schema } from "mongoose";

export interface ISubsidisedList {
  name: string;
  category: string;
}

const subsidisedListSchema = new Schema<ISubsidisedList>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  category: {
    type: String,
    enum: categories,
    required: true,
  },
});

const SubsidisedList: Model<ISubsidisedList> =
  models.SubsidisedList ||
  model<ISubsidisedList>("SubsidisedList", subsidisedListSchema);

export default SubsidisedList;
