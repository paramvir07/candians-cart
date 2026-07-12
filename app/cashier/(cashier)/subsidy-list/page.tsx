import { getSubsidisedList } from "@/actions/admin/subsidyList/subsidyList.actions";
import CashierSidebar from "@/components/cashier/CashierSlidebar";
import SubsidyListView from "@/components/shared/subsidyList/SubsidyListView";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import { Cashier } from "@/db/models/cashier/cashier.model";

const subsidyList = async () => {
  const result = await getSubsidisedList();
  const items = Array.isArray(result.subsidisedList)
    ? result.subsidisedList
    : [];

  const session = await getUserSession();
  const cashierAuthId = session.user.id;
  const cashierData = await Cashier.findOne({ userId: cashierAuthId })
    .select("name email")
    .lean();

  if (!cashierData) {
    throw new Error("Cashier data not found");
  }
  const cashierProps = {
    name: cashierData.name,
    email: cashierData.email,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <CashierSidebar cashierData={cashierProps} />
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          Subsidised Items
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Items eligible for subsidy
        </p>
      </div>
      <SubsidyListView items={items} />
    </div>
  );
};

export default subsidyList;
