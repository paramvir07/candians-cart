import StoreSidebar from '@/components/store/StoreSidebar';
import OrderHeader from '@/components/store/orders/OrdersHeader';
import OrderTable from '@/components/store/orders/OrderTable';

const page = () => {
  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      {/* Sidebar remains on the left */}
      <StoreSidebar />

      <main className="flex-1 flex flex-col p-8">
        
        {/* Header Section - Now pinned to the top */}
        <div className="flex items-center justify-between w-full mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Orders</h1>



          <div className="flex gap-3">
          </div>
        </div>
        <OrderHeader />
        <div className="flex-1">
            <OrderTable />
        </div>

      </main>
    </div>
  )
}

export default page