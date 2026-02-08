"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export const description = "A line chart"

const chartData = [
  {
    month: "January",
    familyA: 4200,
    familyB: 3800,
    familyC: 3100,
    familyD: 2600,
    familyE: 2300,
  },
  {
    month: "February",
    familyA: 5100,
    familyB: 4200,
    familyC: 3600,
    familyD: 3000,
    familyE: 2800,
  },
  {
    month: "March",
    familyA: 4800,
    familyB: 4600,
    familyC: 3900,
    familyD: 3200,
    familyE: 3000,
  },
  {
    month: "April",
    familyA: 3900,
    familyB: 4100,
    familyC: 3400,
    familyD: 2900,
    familyE: 2600,
  },
  {
    month: "May",
    familyA: 5600,
    familyB: 4900,
    familyC: 4200,
    familyD: 3600,
    familyE: 3300,
  },
  {
    month: "June",
    familyA: 6100,
    familyB: 5300,
    familyC: 4700,
    familyD: 4000,
    familyE: 3700,
  },
]

const chartConfig = {
  familyA: {
    label: "Family A",
    color: "var(--chart-1)",
  },
  familyB: {
    label: "Family B",
    color: "var(--chart-2)",
  },
  familyC: {
    label: "Family C",
    color: "var(--chart-3)",
  },
  familyD: {
    label: "Family D",
    color: "var(--chart-4)",
  },
  familyE: {
    label: "Family E",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

export function TopSpenders({ fullHeight }: { fullHeight?: boolean }) {
  return (
    <Card className={fullHeight ? "h-full" : ""}>
      <CardHeader>
        <CardTitle>Top 5 Spending Families</CardTitle>
        <CardDescription>
          Monthly spend comparison (Jan – Jun 2024)
        </CardDescription>
      </CardHeader>

        <CardContent className={fullHeight ? "flex-1 min-h-0" : ""}>
        <ChartContainer config={chartConfig} className={fullHeight ? "h-full w-full" : "w-full"}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />

            <Line
              dataKey="familyA"
              type="natural"
              stroke="var(--color-familyA)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="familyB"
              type="natural"
              stroke="var(--color-familyB)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="familyC"
              type="natural"
              stroke="var(--color-familyC)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="familyD"
              type="natural"
              stroke="var(--color-familyD)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="familyE"
              type="natural"
              stroke="var(--color-familyE)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none font-medium">
          Comparing monthly spend of the top 5 families
        </div>
        <div className="text-muted-foreground leading-none">
          Highest line = highest spender
        </div>
      </CardFooter>
    </Card>
  )
}
