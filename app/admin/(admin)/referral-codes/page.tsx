import { getReferalCodesAction } from "@/actions/admin/referalCode.actions";
import { ReferralCodeDialogForm } from "@/components/admin/referral-codes/ReferralCodeDialogForm";
import { ReferralCodes } from "@/components/admin/referral-codes/ReferralCodes";

const page = async () => {
  const result = await getReferalCodesAction();
  const data = result.referralCodes;

  return (
    <>
      <div className="flex flex-col gap-10 justify-center items-center py-4 max-w-screen">
        <div className="flex justify-between items-center w-full">
          <div className="flex flex-col text-3xl font-extrabold">
            <span>Referal</span>
            <span>Codes</span>
          </div>
          <ReferralCodeDialogForm usage="create" data={null} />
        </div>
        <ReferralCodes data={data} />
      </div>
    </>
  );
};

export default page;
