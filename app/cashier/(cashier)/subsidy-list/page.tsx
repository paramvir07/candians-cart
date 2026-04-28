import { getSubsidisedList } from "@/actions/admin/subsidyList/subsidyList.actions";
import SubsidyListView from "@/components/shared/subsidyList/SubsidyListView";

const subsidyList = async () => {
  const result = await getSubsidisedList();
  const items = Array.isArray(result.subsidisedList)
    ? result.subsidisedList
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
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
