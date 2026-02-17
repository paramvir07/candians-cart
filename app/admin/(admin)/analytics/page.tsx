import { ChartAreaStacked } from "@/components/admin/analytics/AreaChart"
import FilterOptions from "@/components/admin/analytics/FilterOptions"
import MainOverview from "@/components/admin/analytics/MainOverview"
import { ChartPieSimple } from "@/components/admin/analytics/PieChart"
import { TopProducts } from "@/components/admin/analytics/TopProducts"
import { TopSpenders } from "@/components/admin/analytics/TopSpenders"

const page = () => {
  return (
    <div className="flex flex-col gap-5">
    <h1 className="text-2xl mt-5 font-semibold">Analytics</h1>
    <p className="text-sm text-muted-foreground">Track sales, revenue, and user activity across your platform.</p>


      <FilterOptions />
      <MainOverview />

      {/* Pie + Area Chart */}
      <div className="flex flex-col gap-5 lg:flex-row lg:h-105 pb-20 md:pb-0">
        <div className="w-full lg:w-105 lg:h-full">
          <ChartPieSimple />
        </div>

        <div className="lg:w-150 lg:flex-1 lg:h-full">
          <ChartAreaStacked />
        </div>
      </div>

      {/* Top Products + Top Spenders */}
      <div className="flex flex-col gap-5 lg:flex-row lg:h-105 pb-20 md:pb-0">
        {/* LEFT — Top Products */}
        <div className="w-full lg:flex-1 lg:h-full">
          <TopProducts fullHeight />
        </div>

        {/* RIGHT — Top Spenders */}
        <div className="w-full lg:w-105 lg:h-full">
          <TopSpenders fullHeight />
        </div>
      </div>
    </div>
  )
}

export default page
