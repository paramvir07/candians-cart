import { ICustomerInfo } from "@/db/models/customer/customerInfo.model";
import { Types } from "mongoose";

export type CustomerInterface = ICustomerInfo & {
    _id: Types.ObjectId
    __v: number
}
