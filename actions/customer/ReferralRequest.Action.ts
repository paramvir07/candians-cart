import { dbConnect } from "@/db/dbConnect";
import Customer from "@/db/models/customer/customer.model";
import ReferralRequest from "@/db/models/customer/ReferralRequest.model";

interface ReferralRequestData {
    name:string,
    email:string,
    phoneNumber:string
}

export const getRandom10Referrals = async () => {
  try {
    await dbConnect();
    const users = await Customer.aggregate([
      {
        $match: {
          recieveReferralInvites: true,
          placedFirstOrder: true,
          referralCodeEnabled: true,
        },
      },
      { $sample: { size: 10 } },
      {
        $project: {
          _id: 1,
          name: 1,
        },
      },
    ]);
    return { success: true, data: users,message:"" };
  } catch (err) {
    console.log(err);
    return { success: false, message: "Error getting Referrals",data:null };
  }
};

export const GetAlreadySentProfiles = async (Data:ReferralRequestData)=>{
    if(!Data) return {success:false,message:"Partial Data sent"}
    try{
        await dbConnect();
        const request = await ReferralRequest.findOne({phoneNumber:Data.phoneNumber})
        if(!request) return {success:false,message:"No Requests found",data:null}
        return {success:true,message:"Referral Requests found",data:request}
    }catch(err){
        console.log(err)
        return { success: false, message: "Error fetching requests",data:null };
    }
}

export const SendReferralRequest = async (Data:ReferralRequestData,customerId:string) =>{
    if(!customerId||!Data) return {success:false,message:"Partial Data sent"}
    try{
        await dbConnect();
        const request = await ReferralRequest.findOne({phoneNumber:Data.phoneNumber,customerId:customerId})
        if(request) return {success:true,message:"Request already sent to this user"}
        await ReferralRequest.create({
            name:Data.name,
            email:Data.email,
            phoneNumber:Data.phoneNumber,
            customerId:customerId
        })
        return {success:true,message:"Referral Request sent"}

    }catch(err){
        console.log(err)
        return { success: false, message: "Error sending Request" };
    }
}

export const getReferralRequests = async (customerId:string) =>{
    try {
        await dbConnect();
        const RefRequests = await ReferralRequest.find({customerId:customerId})
        if(!RefRequests) return {success:false,message:'No request found',data:null}
        return {success:true,message:"",data:RefRequests}
    } catch (error) {
        console.log(error)
        return {success:false,message:"Error fetching requests",data:null}
    }
}