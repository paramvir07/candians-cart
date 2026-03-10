"use client"

import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

export function TopSpenders({ data, keys, fullHeight }: { data: Record<string, any>[]; keys: string[]; fullHeight?: boolean }) {
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
        <CardTitle>Top 5 Spending Families</CardTitle>
        <CardDescription>Monthly spend comparison</CardDescription>
      </CardHeader>
      <CardContent className={fullHeight ? "flex-1 min-h-0" : ""}>
        <ChartContainer config={chartConfig} className={fullHeight ? "h-full w-full" : "w-full"}>
          <LineChart accessibilityLayer data={safeData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            {Object.keys(chartConfig).map((safeKey) => (
              <Line key={safeKey} dataKey={safeKey} type="natural" stroke={`var(--color-${safeKey})`} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none font-medium">Comparing monthly spend of the top 5 families</div>
      </CardFooter>
    </Card>
  )
}