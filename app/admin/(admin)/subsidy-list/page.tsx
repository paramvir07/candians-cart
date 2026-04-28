import { createSubsidyListItemAction, deleteSubsidyListItemAction, getSubsidisedList, updateSubsidyListItemAction } from "@/actions/admin/subsidyList/subsidyList.actions";
import AdminSubsidyManager from "@/components/admin/subsidisedList/SubsidyManager";


const adminSubsidyList = async () => {
  const result = await getSubsidisedList();
 const items = Array.isArray(result.subsidisedList)
   ? result.subsidisedList
   : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <AdminSubsidyManager
        initialItems={items}
        addItemAction={createSubsidyListItemAction}
        updateItemAction={updateSubsidyListItemAction}
        deleteItemAction={deleteSubsidyListItemAction}
      />
    </div>
  );
};

export default adminSubsidyList;
