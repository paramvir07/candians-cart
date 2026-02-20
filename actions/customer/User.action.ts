"use server";
import { dbConnect } from "@/db/dbConnect";
import CustomerInfo from "@/db/models/customer/customerInfo.model";
import { getUserSession } from "../auth/getUserSession.actions";

export const getUser = async () => {
  try {
    const session = await getUserSession();
    const UserId = session.user.id;

    await dbConnect();
    const UserData = await CustomerInfo.findOne({ userId: UserId }).lean();
    return UserData;
  } catch (error) {
    console.log(error);
  }
};
