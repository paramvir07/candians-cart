import { getSubsidisedList } from "@/actions/admin/subsidyList/subsidyList.actions";
import SubsidyItemsClient from "@/components/customer/budgetpacks/subsidyItemsClient";

export default async function SubsidyItemsPage() {
  const { subsidisedList } = await getSubsidisedList();
  return <SubsidyItemsClient items={subsidisedList} />;
}