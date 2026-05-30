import { getMiscItems } from "@/actions/cashier/MiscItem"
import CashierSidebar from "@/components/cashier/CashierSlidebar"
import MiscItemsList from "@/components/cashier/MiscItemList";

const page = async() => {
    const MiscItems = await getMiscItems();
  return (
    <>
    <div className="px-4 py-8">
      <CashierSidebar />
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          Miscellaneous Items
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
            Review and convert manually created checkout items into inventory products
        </p>
      </div>
      <MiscItemsList items={MiscItems.data ?? []} />
    </div>
    </>
  )
}

export default page