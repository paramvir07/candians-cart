"use client"

import { Pie, PieChart } from "recharts"

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

export const description = "A simple pie chart"

const chartData = [
  { store: "Store A", orders: 420, fill: "var(--chart-1)" },
  { store: "Store B", orders: 310, fill: "var(--chart-2)" },
  { store: "Store C", orders: 220, fill: "var(--chart-3)" },
  { store: "Store D", orders: 180, fill: "var(--chart-4)" },
  { store: "Store E", orders: 140, fill: "var(--chart-5)" },
]

const chartConfig = {
  orders: {
    label: "Orders Completed",
  },
  "Store A": {
    label: "Store A",
    color: "var(--chart-1)",
  },
  "Store B": {
    label: "Store B",
    color: "var(--chart-2)",
  },
  "Store C": {
    label: "Store C",
    color: "var(--chart-3)",
  },
  "Store D": {
    label: "Store D",
    color: "var(--chart-4)",
  },
  "Store E": {
    label: "Store E",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig


export function ChartPieSimple() {
  return (
<Card className="flex flex-col overflow-hidden shrink-0 lg:h-full">
      <CardHeader className="items-center pb-4 shrink-0">
        <CardTitle>Orders completed</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 flex items-center justify-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="w-full h-[220px] md:h-[260px] lg:h-full"

        >
          <PieChart width={undefined} height={undefined}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="orders"
              nameKey="store"
              innerRadius="45%"
              outerRadius="80%"
            />

          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

