"use server"
import { ReferralAcceptedEmail } from "@/components/EmailTemplates/ReferralAcceptEmail";
import { dbConnect } from "@/db/dbConnect";
import ReferralCode from "@/db/models/admin/referralCode.model";
import Customer from "@/db/models/customer/customer.model";
import ReferralRequest from "@/db/models/customer/ReferralRequest.model";
import { sendEmail } from "@/lib/auth/email";
import { getReferralShareMessageTwilio } from "@/lib/shareMessage";
import { sendSMS } from "@/lib/twilio/twilio";
import { revalidatePath } from "next/cache";

interface ReferralRequestData {
    name: string,
    email?: string,
    phoneNumber: string
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
    // Serialize here so page.tsx doesn't have to worry about it
    const serialized = users.map((u) => ({
      _id: u._id.toString(),
      name: u.name as string,
    }));
    return { success: true, data: serialized, message: "" };
  } catch (err) {
    console.log(err);
    return { success: false, message: "Error getting Referrals", data: null };
  }
};

export const GetAlreadySentProfiles = async (Data: ReferralRequestData) => {
    if (!Data) return { success: false, message: "Partial Data sent" }
    try {
        await dbConnect();
        const request = await ReferralRequest.findOne({ phoneNumber: Data.phoneNumber })
        if (!request) return { success: false, message: "No Requests found", data: null }
        return { success: true, message: "Referral Requests found", data: request }
    } catch (err) {
        console.log(err)
        return { success: false, message: "Error fetching requests", data: null };
    }
}

export const SendReferralRequest = async (Data: ReferralRequestData, memberId: string) => {
    if (!memberId || !Data) return { success: false, message: "Partial Data sent" }
    const normalizeCanadianPhone = (raw: string) => {
      const digits = raw.replace(/\D/g, "");
      return `+1${digits.startsWith("1") ? digits.slice(1) : digits}`;
    };
    try {
        await dbConnect();
        const existing = await ReferralRequest.findOne({
            phoneNumber: Data.phoneNumber.replace(/[\s\-().]/g, ""),
            customerId: memberId
        })

        if (existing) {
            if (existing.accepted === null || existing.accepted === true) {
                return { success: true, message: "already_sent" }
            }
            await ReferralRequest.findByIdAndUpdate(existing._id, {
                accepted: null,
                name: Data.name,
                email: Data.email ?? "",
            })
            return { success: true, message: "sent" }
        }

        await ReferralRequest.create({
            name: Data.name,
            email: Data.email ?? "",
            phoneNumber: normalizeCanadianPhone(Data.phoneNumber),
            customerId: memberId,
            accepted: null
        })
        return { success: true, message: "sent" }
    } catch (err) {
        console.log(err)
        return { success: false, message: "Error sending Request" };
    }
}

export const getAlreadySentMemberIds = async (phoneNumber: string) => {
    try {
        await dbConnect();
        const requests = await ReferralRequest.find(
            { phoneNumber: phoneNumber.replace(/[\s\-().]/g, "") },
            { customerId: 1, _id: 0, accepted: 1 }
        ).lean()
        const serialized = requests.map((r) => ({
            memberId: r.customerId.toString(),
            accepted: r.accepted,
        }))
        return { success: true, data: serialized }
    } catch (err) {
        console.log(err)
        return { success: false, data: [] }
    }
}

export const getReferralRequests = async (customerId: string) => {
    try {
        await dbConnect();
        const RefRequests = await ReferralRequest.find({ customerId: customerId })
        if (!RefRequests) return { success: false, message: 'No request found', data: null }
        return { success: true, message: "", data: RefRequests }
    } catch (error) {
        console.log(error)
        return { success: false, message: "Error fetching requests", data: null }
    }
}


export interface SerializedReferralRequest {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  accepted: boolean | null;
  customerId: string;
  createdAt: string;
  updatedAt: string;
}

export const getPendingReferralRequests = async (customerId: string) => {
  try {
    await dbConnect();
    const docs = await ReferralRequest.find({
      customerId,
      accepted: null,
    })
      .sort({ createdAt: -1 })
      .lean();

    const data: SerializedReferralRequest[] = docs.map((r) => ({
      _id: r._id.toString(),
      name: r.name,
      email: r.email,
      phoneNumber: r.phoneNumber,
      accepted: r.accepted,
      customerId: r.customerId.toString(),
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
      updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : String(r.updatedAt),
    }));

    return { success: true, data };
  } catch (err) {
    console.error(err);
    return { success: false, data: [] as SerializedReferralRequest[], message: "Error fetching requests" };
  }
};

export const respondToReferralRequest = async (
  requestId: string,
  accept: boolean
) => {
  if (!requestId) return { success: false, message: "Missing request ID" };

  try {
    await dbConnect();

    await ReferralRequest.findByIdAndUpdate(requestId, { accepted: accept });
    revalidatePath("/customer/referrals/requests");

    if (!accept) return { success: true };

    const request = await ReferralRequest.findById(requestId).lean();
    if (!request) return { success: false, message: "Request not found" };

    const [customer, [referralCode]] = await Promise.all([
      Customer.findById(request.customerId).lean(),
      ReferralCode.find({ customerId: request.customerId }).lean(),
    ]);

    if (!customer)     return { success: false, message: "Member not found" };
    if (!referralCode) return { success: false, message: "Referral code not found" };

    const code      = referralCode.code;
    const signUpUrl = `https://www.canadianscart.ca/customer/sign-up?referralCode=${code}&heard=refer`;

    const splitName = request.name.split(" ")
    
    await Promise.all([
      sendSMS(request.phoneNumber, getReferralShareMessageTwilio(code,splitName[0])),
      sendEmail({
        to: request.email,
        subject: `${customer.name} accepted your referral request 🎉`,
        react: ReferralAcceptedEmail({
          recipientName: request.name,
          referralCode:  code,
          referrerName:  customer.name,
          signUpUrl,
        }),
      }),
    ]);

    return { success: true };
  } catch (err) {
    console.error("[respondToReferralRequest]", err);
    return { success: false, message: "Failed to update request" };
  }
};

export const getNumberofPendingRequest = async (customerId:string) =>{
    try{
        await dbConnect();
        const num = await ReferralRequest.countDocuments({
        customerId,
        accepted: null,
        });
        
        return {success:true,total:num}

    }catch(err){
        console.log(err)
        return {success:false,total:0}
    }
}