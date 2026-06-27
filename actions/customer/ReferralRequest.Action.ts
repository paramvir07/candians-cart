"use server"
import { dbConnect } from "@/db/dbConnect";
import Customer from "@/db/models/customer/customer.model";
import ReferralRequest from "@/db/models/customer/ReferralRequest.model";

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
    try {
        await dbConnect();
        // Check if this phone number has already sent a request to this specific member
        const existing = await ReferralRequest.findOne({
            phoneNumber: Data.phoneNumber.replace(/[\s\-().]/g, ""),
            customerId: memberId
        })
        if (existing) return { success: true, message: "already_sent" }

        await ReferralRequest.create({
            name: Data.name,
            email: Data.email ?? "",
            phoneNumber: Data.phoneNumber.replace(/[\s\-().]/g, ""),
            customerId: memberId,
            accepted: null
        })
        return { success: true, message: "sent" }
    } catch (err) {
        console.log(err)
        return { success: false, message: "Error sending Request" };
    }
}

// Get all member IDs that this phone number has already sent requests to
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