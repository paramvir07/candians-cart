import { getSubsidisedList } from "@/actions/admin/subsidyList/subsidyList.actions";
import BudgetPacks from "@/components/customer/budgetpacks/packs"
import Navbar from "@/components/customer/landing/Navbar";

const page = async() => {
    const { subsidisedList } = await getSubsidisedList();

  return (
    <div>
      <Navbar />
      <BudgetPacks subsidyItems={subsidisedList} />
    </div>
  );
}

export default page