import OrderHeader from "@/components/store/orders/OrdersHeader";
import OrderTable from "@/components/store/orders/OrderTable";
// Make sure the import name matches the export from the file above
import { AddOrderBanner } from "@/components/store/orders/AddOrdersBanner";

const Page = () => {
  return (
    <div className="w-full">
      {/* 1. Main Page Header */}
      <div className="flex items-center justify-between w-full mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Orders
        </h1>
        <div className="flex gap-3"></div>
      </div>

      {/* 2. Filters */}
      <div className="mb-6">
         <OrderHeader />
      </div>

      {/* 3. Content Area */}
      {/* Use flex-col and gap-6 to separate the Banner from the Table cleanly */}
      <div className="flex flex-col gap-6 w-full">
        <AddOrderBanner />
        <OrderTable />
      </div>
    </div>
  );
};

export default Page;