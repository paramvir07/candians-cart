"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

export function TopProducts({ data, keys, fullHeight }: { data: Record<string, any>[]; keys: string[]; fullHeight?: boolean }) {
  const chartConfig = keys.reduce((acc, key, i) => {
    const safeKey = key.replace(/[^a-zA-Z0-9]/g, "") || `key${i}`
    acc[safeKey] = { label: key, color: `var(--chart-${(i % 5) + 1})` }
    return acc
  }, {} as ChartConfig)

  const safeData = data.map(d => {
    const nd: Record<string, any> = { month: d.month }
    keys.forEach((k, i) => {
      const safeKey = k.replace(/[^a-zA-Z0-9]/g, "") || `key${i}`
      nd[safeKey] = d[k] || 0
    })
    return nd
  })

  return (
    <Card className={fullHeight ? "h-full" : ""}>      
      <CardHeader>
        <CardTitle>Top 5 Products</CardTitle>
        <CardDescription>Monthly sales quantity</CardDescription>
      </CardHeader>
      <CardContent className={fullHeight ? "flex-1 min-h-0" : ""}>
        <ChartContainer config={chartConfig} className={fullHeight ? "h-full w-full" : "w-full"}>
          <BarChart accessibilityLayer data={safeData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => value.slice(0, 3)} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {Object.keys(chartConfig).map((safeKey) => (
               <Bar key={safeKey} dataKey={safeKey} fill={`var(--color-${safeKey})`} />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none font-medium">Comparing top-selling products month over month</div>
      </CardFooter>
    </Card>
  )
}