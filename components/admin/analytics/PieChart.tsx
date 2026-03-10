"use client"

import { Pie, PieChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

export function ChartPieSimple({ data }: { data: { store: string; orders: number }[] }) {
  const chartConfig = { orders: { label: "Orders Completed" } } as ChartConfig
  
  const formattedData = data.map((d, i) => {
    const safeKey = d.store.replace(/[^a-zA-Z0-9]/g, "") || `store${i}`
    chartConfig[safeKey] = { label: d.store, color: `var(--chart-${(i % 5) + 1})` }
    return { ...d, storeSafe: safeKey, fill: `var(--color-${safeKey})` }
  })

  return (
    <Card className="flex flex-col overflow-hidden shrink-0 lg:h-full">
      <CardHeader className="items-center pb-4 shrink-0">
        <CardTitle>Orders completed</CardTitle>
        <CardDescription>By Store</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 flex items-center justify-center pb-0">
        <ChartContainer config={chartConfig} className="w-full h-55 md:h-65 lg:h-full">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={formattedData} dataKey="orders" nameKey="storeSafe" innerRadius="45%" outerRadius="80%" />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}