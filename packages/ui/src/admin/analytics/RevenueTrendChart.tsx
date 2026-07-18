"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  ComposedChart,
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
import type { RevenueTrendPoint } from "@/actions/admin/analytics/analytics.action";

const chartConfig: ChartConfig = {
  revenue: { label: "Revenue ($)", color: "var(--chart-1)" },
  orders: { label: "Orders", color: "var(--chart-2)" },
};

export function RevenueTrendChart({ data }: { data: RevenueTrendPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue &amp; Orders — 12 months</CardTitle>
        <CardDescription>
          Monthly platform-wide revenue (bars) and order count (line)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ left: 8, right: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(v) => v.slice(0, 3)}
              />
              <YAxis
                yAxisId="rev"
                orientation="left"
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                width={48}
              />
              <YAxis
                yAxisId="ord"
                orientation="right"
                tickLine={false}
                axisLine={false}
                width={36}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                yAxisId="rev"
                dataKey="revenue"
                fill="var(--color-revenue)"
                radius={[4, 4, 0, 0]}
                opacity={0.85}
              />
              <Line
                yAxisId="ord"
                dataKey="orders"
                stroke="var(--color-orders)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "var(--color-orders)" }}
                type="monotone"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
