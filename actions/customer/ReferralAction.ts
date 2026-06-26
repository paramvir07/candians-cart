"use server"

import { dbConnect } from "@/db/dbConnect"
import ReferralCode from "@/db/models/admin/referralCode.model";
import { WalletTopUp } from "@/db/models/cashier/walletTopUp.model";
import Customer from "@/db/models/customer/customer.model";
import { getUserSession } from "../auth/getUserSession.actions";

export const getReferral = async (referralId:string) =>{
    try{
        await dbConnect();
        const referral = await ReferralCode.findById(referralId);
        if(!referral) return {success:false,message:"Error fetching Referral",data:null}
        return {success:true,message:"Referral Code Found",data:referral}
    }catch(err){
        console.log(err)
        return {success:false,message:"Error fetching Referral",data:null}
    }
}

export const getReferralUsed = async (referralId: string, customerId: string) => {
  try {
    await dbConnect();

    const [UsedBy, ReferralTopUps] = await Promise.all([
      Customer.find({ referralCodeId: referralId }).lean(),
      WalletTopUp.find({ customerId: customerId, paymentMode: "referral" }).lean(),
    ]);

    const totalEarned = ReferralTopUps.reduce((sum, t) => sum + (t.value ?? 0), 0);

    return {
      success: true,
      data: {
        usedBy: UsedBy,
        totalEarned, 
      },
    };
  } catch (err) {
    console.error("getReferralUsed error:", err);
    return { success: false, data: null };
  }
};


export async function setReferralInvites(enabled: boolean) {
  const session = await getUserSession();
  if (!session?.user?.email) return { error: "Unauthorized" };

  await dbConnect();
  await Customer.findOneAndUpdate(
    { email: session.user.email },
    { recieveReferralInvites: enabled }
  );
  return { success: true };
}