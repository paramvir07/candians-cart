"use server"
import { ReferralAcceptedEmail } from "@/components/EmailTemplates/ReferralAcceptEmail";
import { ReferralRequestEmail } from "@/components/EmailTemplates/ReferralRequestEmail";
import { dbConnect } from "@/db/dbConnect";
import ReferralCode from "@/db/models/admin/referralCode.model";
import Customer from "@/db/models/customer/customer.model";
import ReferralRequest from "@/db/models/customer/ReferralRequest.model";
import { sendEmail } from "@/lib/auth/email";
import { getReferralRequestMessage, getReferralShareMessageTwilio, getReferralUrl } from "@/lib/shareMessage";
import { sendSMS } from "@/lib/twilio/twilio";
import { revalidatePath } from "next/cache";

interface ReferralRequestData {
    name: string,
    email?: string,
    phoneNumber: string,
    budget: string
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
          myreferralCodeId: { $exists: true, $ne: null },
        },
      },
      { $sample: { size: 10 } },
      {
        $lookup: {
          from: "referralcodes",
          localField: "myreferralCodeId",
          foreignField: "_id",
          as: "referralCode",
        },
      },
      {
        $unwind: {
          path: "$referralCode",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          uses: "$referralCode.uses",
          maxUses: "$referralCode.maxUses",
        },
      },
    ]);

    const serialized = users.map((u) => ({
      _id: u._id.toString(),
      name: u.name as string,
      uses: (u.uses as number | undefined) ?? 0,
      maxUses: (u.maxUses as number | null | undefined) ?? null,
    }));

    return {
      success: true,
      data: serialized,
      message: "",
    };
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

export const SendReferralRequest = async (data: ReferralRequestData, memberId: string) => {
  if (!memberId || !data) {
    return { success: false, message: "Partial Data sent" };
  }

  const normalizeCanadianPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    return `+1${digits.startsWith("1") ? digits.slice(1) : digits}`;
  };

  try {
    await dbConnect();

    const phoneNumber = normalizeCanadianPhone(data.phoneNumber);
    const email = data.email ?? "";

    const existing = await ReferralRequest.findOne({
      phoneNumber,
      customerId: memberId,
    });

    if (existing) {
      if (existing.accepted === null || existing.accepted === true) {
        return { success: true, message: "already_sent" };
      }

      await ReferralRequest.findByIdAndUpdate(existing._id, {
        accepted: null,
        name: data.name,
        email,
      });

      return { success: true, message: "sent" };
    }

    const member = await Customer.findById(memberId).select(
      "name email mobile"
    );

    await ReferralRequest.create({
      name: data.name,
      email,
      phoneNumber,
      customerId: memberId,
      budget: Number(data.budget),
      accepted: null,
    });

    const firstName = data.name.trim().split(/\s+/)[0];

    const notifications: Promise<unknown>[] = [];

    if (member?.mobile) {
      notifications.push(
        sendSMS(
          member.mobile,
          getReferralRequestMessage(firstName)
        )
      );
    }

    if (member?.email) {
      notifications.push(
        sendEmail({
          to: member.email,
          subject: `${data.name} requested a referral invite 🎫`,
          react: ReferralRequestEmail({
            recipientName: member.name,
            requesterName: data.name,
            manageRequestsUrl: "https://canadianscart.ca/customer/referrals/requests",
          }),
        })
      );
    }

    await Promise.all(notifications);

    return { success: true, message: "sent" };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      message: "Error sending request",
    };
  }
};

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

export const respondToReferralRequest = async ( requestId: string, accept: boolean ) => {
  if (!requestId) return { success: false, message: "Missing request ID" };

  try {
    await dbConnect();

    const request = await ReferralRequest.findByIdAndUpdate(
      requestId,
      { accepted: accept },
      { new: true }
    ).lean();

    if (!request) return { success: false, message: "Request not found" };

    revalidatePath("/customer/referrals/requests");

    if (!accept) return { success: true };

    const [customer, [referralCode]] = await Promise.all([
      Customer.findById(request.customerId).lean(),
      ReferralCode.find({ customerId: request.customerId }).lean(),
    ]);

    if (!customer)     return { success: false, message: "Member not found" };
    if (!referralCode) return { success: false, message: "Referral code not found" };

    const code      = referralCode.code;
    const signUpUrl = getReferralUrl(code);
    const firstName = request.name.trim().split(/\s+/)[0];

    await Promise.all([
      sendSMS(request.phoneNumber, getReferralShareMessageTwilio(code, firstName)),
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