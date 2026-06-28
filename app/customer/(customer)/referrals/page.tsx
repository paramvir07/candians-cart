import { Suspense } from "react";
import { getReferral, getReferralUsed } from "@/actions/customer/ReferralAction";
import { getUser } from "@/actions/customer/User.action";
import Navbar from "@/components/customer/landing/Navbar";
import {
  ReferralPageClient,
  ReferralDocument,
} from "@/components/customer/referral/ReferralPageClient";
import { NotEligibleState } from "@/components/customer/referral/ReferralEmptyStates";
import { ReferralGenerate } from "@/components/customer/referral/ReferralGenerate";
import { ReferralPageSkeleton } from "@/components/skeletons/Referralpageskeleton";
import { getNumberofPendingRequest } from "@/actions/customer/ReferralRequest.Action";


async function ReferralContent() {
  const UserData = await getUser();
  if (!UserData) return null;

  const NotEligible =
    !UserData.placedFirstOrder && !UserData.referralCodeEnabled;

  const ReferralNotGenerated =
    UserData.placedFirstOrder &&
    UserData.referralCodeEnabled &&
    (!UserData.myreferralCodeId || UserData.myreferralCodeId === null);

  if (NotEligible) return <NotEligibleState />;

  if (ReferralNotGenerated)
    return (
      <>
        <Navbar />
        <ReferralGenerate
          customerId={UserData._id.toString()}
          customerName={UserData.name}
        />
      </>
    );

  const referralId = UserData.myreferralCodeId!.toString();
  const customerId = UserData._id.toString();

  const [ReferralData, UsedReferral,RequestCount] = await Promise.all([
    getReferral(referralId),
    getReferralUsed(referralId, customerId),
    getNumberofPendingRequest(customerId)
  ]);

  if (!ReferralData.data) return null;

  const d = ReferralData.data;
  const usedData = UsedReferral?.data;

  const referralDoc: ReferralDocument = {
    _id: d._id.toString(),
    code: d.code,
    maxUses: d.maxUses ?? 0,
    expiresAt:
      d.expiresAt instanceof Date
        ? d.expiresAt.toISOString()
        : String(d.expiresAt),
    isActive: d.isActive,
    uses: d.uses ?? 0,
    customerId: d.customerId?.toString() ?? "",
    type: d.type,
    createdAt:
      d.createdAt instanceof Date
        ? d.createdAt.toISOString()
        : String(d.createdAt),
    updatedAt:
      d.updatedAt instanceof Date
        ? d.updatedAt.toISOString()
        : String(d.updatedAt),
    totalEarned: usedData?.totalEarned ?? 0,
    usedBy: (usedData?.usedBy ?? []).map((u) => ({
      _id: u._id.toString(),
      name: u.name,
      email: u.email,
      placedFirstOrder: u.placedFirstOrder,
      createdAt:
        u.createdAt instanceof Date
          ? u.createdAt.toISOString()
          : String(u.createdAt),
    })),
  };

  const userData = {
    name: UserData.name,
    perReferAmount:UserData.perReferAmount,
    placedFirstOrder: UserData.placedFirstOrder,
    referralCodeEnabled: UserData.referralCodeEnabled,
    myreferralCodeId: UserData.myreferralCodeId?.toString() ?? null,
    recieveReferralInvites: UserData.recieveReferralInvites,
  };


  return <ReferralPageClient referralData={referralDoc} userData={userData} ReqCount={RequestCount.total} />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const Page = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <Suspense fallback={<ReferralPageSkeleton />}>
        <ReferralContent />
      </Suspense>
    </div>
  );
};

export default Page;