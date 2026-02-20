"use server";
import { dbConnect } from "@/db/dbConnect";
import { getUserSession } from "../auth/getUserSession.actions";
import Customer from "@/db/models/customer/customer.model";

export const getUser = async () => {
  try {
    const session = await getUserSession();
    const UserId = session.user.id;

    await dbConnect();
    const UserData = await Customer.findOne({ userId: UserId }).lean();
    return UserData;
  } catch (error) {
    console.log(error);
  }
};
