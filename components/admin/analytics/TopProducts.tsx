"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export const description = "A stacked bar chart with a legend"

const chartData = [
  {
    month: "January",
    basmatiRice: 420,
    atta: 360,
    masala: 280,
    ghee: 240,
    tea: 310,
  },
  {
    month: "February",
    basmatiRice: 510,
    atta: 430,
    masala: 320,
    ghee: 290,
    tea: 360,
  },
  {
    month: "March",
    basmatiRice: 480,
    atta: 410,
    masala: 300,
    ghee: 270,
    tea: 340,
  },
  {
    month: "April",
    basmatiRice: 390,
    atta: 350,
    masala: 260,
    ghee: 230,
    tea: 300,
  },
  {
    month: "May",
    basmatiRice: 560,
    atta: 480,
    masala: 360,
    ghee: 320,
    tea: 410,
  },
  {
    month: "June",
    basmatiRice: 610,
    atta: 520,
    masala: 390,
    ghee: 350,
    tea: 450,
  },
]


const chartConfig = {
  basmatiRice: {
    label: "Basmati Rice",
    color: "var(--chart-1)",
  },
  atta: {
    label: "Wheat Atta",
    color: "var(--chart-2)",
  },
  masala: {
    label: "Spice Masala",
    color: "var(--chart-3)",
  },
  ghee: {
    label: "Desi Ghee",
    color: "var(--chart-4)",
  },
  tea: {
    label: "Assam Tea",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig


export function TopProducts({ fullHeight }: { fullHeight?: boolean }) {
  return (
    <Card className={fullHeight ? "h-full" : ""}>      
    <CardHeader>
        <CardTitle>Top 5 Products</CardTitle>
        <CardDescription>Monthly sales (Jan – Jun 2024)</CardDescription>
      </CardHeader>

        <CardContent className={fullHeight ? "flex-1 min-h-0" : ""}>
        <ChartContainer config={chartConfig} className={fullHeight ? "h-full w-full" : "w-full"}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />

            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />

            <Bar dataKey="basmatiRice" fill="var(--color-basmatiRice)" />
            <Bar dataKey="atta" fill="var(--color-atta)" />
            <Bar dataKey="masala" fill="var(--color-masala)" />
            <Bar dataKey="ghee" fill="var(--color-ghee)" />
            <Bar dataKey="tea" fill="var(--color-tea)" />
          </BarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none font-medium">
          Comparing top-selling products month over month
        </div>
        <div className="text-muted-foreground leading-none">
          Higher bars indicate higher sales volume
        </div>
      </CardFooter>
    </Card>
  )
}
