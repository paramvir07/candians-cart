import { getSubsidisedList } from "@canadian-cart/actions/admin/subsidyList/subsidyList.actions";
import BudgetPacks from "@canadian-cart/ui/customer/budgetpacks/packs";

export default async function BudgetPacksLoader() {
  const { subsidisedList } = await getSubsidisedList();
  return <BudgetPacks subsidyItems={subsidisedList} />;
}