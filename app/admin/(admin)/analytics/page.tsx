import { Suspense } from "react"
import { ChartAreaStacked } from "@/components/admin/analytics/AreaChart"
import FilterOptions from "@/components/admin/analytics/FilterOptions"
import MainOverview from "@/components/admin/analytics/MainOverview"
import { ChartPieSimple } from "@/components/admin/analytics/PieChart"
import { TopProducts } from "@/components/admin/analytics/TopProducts"
import { TopSpenders } from "@/components/admin/analytics/TopSpenders"
import ReceiptPage from "@/components/admin/analytics/reciept/RecieptComponent"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  getOverviewStats, getPieChartData, getAreaChartData, getTopProductsData, getTopSpendersData 
} from "@/actions/admin/analytics/analytics.action"

async function OverviewWrapper() {
  const data = await getOverviewStats()
  return <MainOverview data={data} />
}

async function PieChartWrapper() {
  const data = await getPieChartData()
  return <ChartPieSimple data={data} />
}

async function AreaChartWrapper() {
  const { data, keys } = await getAreaChartData()
  return <ChartAreaStacked data={data} keys={keys} />
}

async function TopProductsWrapper() {
  const { data, keys } = await getTopProductsData()
  // Cast keys to string[] here to satisfy TypeScript
  return <TopProducts data={data} keys={keys as string[]} fullHeight />
}

async function TopSpendersWrapper() {
  const { data, keys } = await getTopSpendersData()
  // Cast keys to string[] here to satisfy TypeScript
  return <TopSpenders data={data} keys={keys as string[]} fullHeight />
}

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl mt-5 font-semibold">Analytics</h1>
      <p className="text-sm text-muted-foreground">Track sales, revenue, and user activity across your platform.</p>

      <FilterOptions />
      
      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <OverviewWrapper />
      </Suspense>

      <div className="flex flex-col gap-5 lg:flex-row lg:h-105 pb-20 md:pb-0">
        <div className="w-full lg:w-105 lg:h-full">
          <Suspense fallback={<Skeleton className="h-full w-full" />}>
            <PieChartWrapper />
          </Suspense>
        </div>

        <div className="lg:w-150 lg:flex-1 lg:h-full">
          <Suspense fallback={<Skeleton className="h-full w-full" />}>
            <AreaChartWrapper />
          </Suspense>
        </div>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:h-105 pb-20 md:pb-0">
        <div className="w-full lg:flex-1 lg:h-full">
          <Suspense fallback={<Skeleton className="h-full w-full" />}>
            <TopProductsWrapper />
          </Suspense>
        </div>

        <div className="w-full lg:w-105 lg:h-full">
          <Suspense fallback={<Skeleton className="h-full w-full" />}>
            <TopSpendersWrapper />
          </Suspense>
        </div>
      </div>
      
      <ReceiptPage />
    </div>
  )
}