import { model, models, Schema } from "mongoose";

const VendorSchema = new Schema(
  {
    // name of the business
    operatingName: {
      type: String,
      required: true,
    },
    // name of the person
    vendorName: {
      type: String,
      required: false,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    contactEmail: {
      type: String,
      required: false,
    },
    // Business Number (BN) from the Canada Revenue Agency (CRA)
    BusinessNumber: {
      type: String,
      required: false,
    },
    PSTNumber: {
      type: String,
      required: false,
    },
    linkedStores: [
      {
        type: Schema.Types.ObjectId,
        ref: "Store",
        required: false,
      },
    ],
  },
  { timestamps: true },
);

export default models.Vendor || model("Vendor", VendorSchema);
