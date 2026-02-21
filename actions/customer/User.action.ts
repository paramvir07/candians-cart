"use server";
import { dbConnect } from "@/db/dbConnect";
import { getUserSession } from "../auth/getUserSession.actions";
import Customer from "@/db/models/customer/customer.model";
import { NextResponse } from "next/server";

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

export const GetUserfromSession = async (sessionId:string|null) =>{
  if(!sessionId) return null;
  try {
    await dbConnect();
    const user = await Customer.findOne({userId:sessionId}).lean();
    return user || null;

  } catch (error) {
    console.log(error);
    NextResponse.json({error:"Failed to fetch user"}, {status:500})
  }

}