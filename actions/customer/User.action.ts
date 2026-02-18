"use server"
import { dbConnect } from "@/db/dbConnect";
import getUserSession from "../auth/getUserSession"
import CustomerInfo from "@/db/models/customer/customerInfo.model";

export const getUser = async () =>{
    try {
    const session = await getUserSession();
    if(!session) return null;
    const UserId = session.user.id;
    
    await dbConnect();
    const UserData = await CustomerInfo.findOne({userId: UserId}).lean();
    return UserData;

    } catch (error) {
        console.log(error)
    }

}