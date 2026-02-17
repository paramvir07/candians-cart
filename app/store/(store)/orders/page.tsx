import OrderHeader from "@/components/store/orders/OrdersHeader";
import OrderTable from "@/components/store/orders/OrderTable";

const page = () => {
  return (
    <div>
      <div className="flex items-center justify-between w-full mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Orders
        </h1>
        <div className="flex gap-3"></div>
      </div>
      <OrderHeader />
      <div className="flex-1">
        <OrderTable />
      </div>
    </div>
  );
};

export default page;
