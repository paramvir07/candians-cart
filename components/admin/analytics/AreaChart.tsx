"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

export function ChartAreaStacked({ data, keys }: { data: Record<string, any>[]; keys: string[] }) {
  // Dynamically assign safe CSS variable colors filtering out whitespace
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
    <Card className="flex flex-col lg:h-full">
      <CardHeader className="shrink-0">
        <CardTitle>Revenue by stores</CardTitle>
        <CardDescription>Monthly trends</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={safeData} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              {Object.keys(chartConfig).map((safeKey) => (
                <Area key={safeKey} dataKey={safeKey} type="natural" fill={`var(--color-${safeKey})`} fillOpacity={0.4} stroke={`var(--color-${safeKey})`} stackId="a" />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}