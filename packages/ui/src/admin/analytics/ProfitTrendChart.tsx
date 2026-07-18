"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ProfitTrendPoint } from "@/actions/admin/analytics/analytics.action";

const chartConfig: ChartConfig = {
  profit: { label: "Platform Profit ($)", color: "var(--chart-1)" },
  fee: { label: "Platform Fee ($)", color: "var(--chart-2)" },
};

export function ProfitTrendChart({ data }: { data: ProfitTrendPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Profit &amp; Fees — 12 months</CardTitle>
        <CardDescription>
          Monthly platform profit and fixed per-order fee
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 8, right: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(v) => v.slice(0, 3)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
                width={48}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="profit" stackId="a" fill="var(--color-profit)" />
              <Bar
                dataKey="fee"
                stackId="a"
                fill="var(--color-fee)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
