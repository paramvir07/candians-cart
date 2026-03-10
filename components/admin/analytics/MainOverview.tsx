import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import { fmt } from "@/lib/fomatPrice"

export default function MainOverview({ data }: { data: { totalRevenue: number; totalOrders: number; avgOrderValue: number } }) {
  const stats = [
    { label: "Gross Revenue", value: fmt(data.totalRevenue), change: "0%", isUp: true },
    { label: "Avg Order Value", value: fmt(data.avgOrderValue), change: "0%", isUp: true },
    { label: "Total Orders", value: data.totalOrders.toLocaleString(), change: "0%", isUp: true },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
      {stats.map((item) => (
        <Card key={item.label}>
          <CardContent className="pt-6 pb-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{item.label}</p>
              <div className={`flex items-center gap-1 text-xs ${item.isUp ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"} p-1 rounded-sm`}>
                {item.isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {item.change}
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{item.value}</p>
          </CardContent>
          <CardFooter className="pb-6">
            <p className="text-xs text-muted-foreground">All time statistics</p>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}