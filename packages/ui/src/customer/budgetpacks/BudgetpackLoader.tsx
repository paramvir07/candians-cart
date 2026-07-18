import { getSubsidisedList } from "@/actions/admin/subsidyList/subsidyList.actions";
import BudgetPacks from "@/components/customer/budgetpacks/packs";

export default async function BudgetPacksLoader() {
  const { subsidisedList } = await getSubsidisedList();
  return <BudgetPacks subsidyItems={subsidisedList} />;
}