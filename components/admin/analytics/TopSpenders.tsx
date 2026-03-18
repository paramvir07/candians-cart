"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Users } from "lucide-react";

export function TopSpenders({
  data,
  keys,
  fullHeight,
}: {
  data: Record<string, any>[];
  keys: string[];
  fullHeight?: boolean;
}) {
  if (!data.length || !keys.length) {
    return (
      <Card className={fullHeight ? "h-full flex flex-col" : ""}>
        <CardHeader>
          <CardTitle>Top 5 Spending Families</CardTitle>
          <CardDescription>Monthly spend comparison</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center py-12">
          <div className="text-center text-muted-foreground">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">No data yet</p>
            <p className="text-xs mt-1">
              Top spenders will appear as orders complete
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartConfig = keys.reduce((acc, key, i) => {
    const safeKey = key.replace(/[^a-zA-Z0-9]/g, "") || `key${i}`;
    acc[safeKey] = { label: key, color: `var(--chart-${(i % 5) + 1})` };
    return acc;
  }, {} as ChartConfig);

  const safeData = data.map((d) => {
    const nd: Record<string, any> = { month: d.month };
    keys.forEach((k, i) => {
      const safeKey = k.replace(/[^a-zA-Z0-9]/g, "") || `key${i}`;
      nd[safeKey] = d[k] || 0;
    });
    return nd;
  });

  return (
    <Card className={fullHeight ? "h-full flex flex-col" : ""}>
      <CardHeader>
        <CardTitle>Top 5 Spending Families</CardTitle>
        <CardDescription>Monthly spend in CAD</CardDescription>
      </CardHeader>
      <CardContent className={fullHeight ? "flex-1 min-h-0" : ""}>
        <ChartContainer
          config={chartConfig}
          className={
            fullHeight ? "h-full w-full min-h-[200px]" : "w-full min-h-[200px]"
          }
        >
          <LineChart data={safeData} margin={{ left: 8, right: 8 }}>
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
              width={44}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            {Object.keys(chartConfig).map((safeKey) => (
              <Line
                key={safeKey}
                dataKey={safeKey}
                type="monotone"
                stroke={`var(--color-${safeKey})`}
                strokeWidth={2}
                dot={{ r: 3, fill: `var(--color-${safeKey})` }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="pt-0">
        <p className="text-xs text-muted-foreground">
          Monthly spend of the top 5 families
        </p>
      </CardFooter>
    </Card>
  );
}
