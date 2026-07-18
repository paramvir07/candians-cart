"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
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

function EmptyState() {
  return (
    <Card className="flex flex-col lg:h-full">
      <CardHeader className="shrink-0">
        <CardTitle>Revenue by stores</CardTitle>
        <CardDescription>Monthly trends</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="flex items-end gap-1 mx-auto mb-3 justify-center h-12">
            {[3, 5, 2, 7, 4, 6].map((h, i) => (
              <div
                key={i}
                className="w-4 rounded-t bg-muted"
                style={{ height: `${h * 6}px`, opacity: 0.4 + i * 0.1 }}
              />
            ))}
          </div>
          <p className="text-sm font-medium">Not enough data yet</p>
          <p className="text-xs mt-1">
            Revenue trends will appear as orders come in
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ChartAreaStacked({
  data,
  keys,
}: {
  data: Record<string, any>[];
  keys: string[];
}) {
  if (!data.length || !keys.length) return <EmptyState />;

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

  // Check if all values are 0
  const hasData = safeData.some((d) =>
    Object.entries(d)
      .filter(([k]) => k !== "month")
      .some(([, v]) => (v as number) > 0),
  );
  if (!hasData) return <EmptyState />;

  return (
    <Card className="flex flex-col lg:h-full">
      <CardHeader className="shrink-0">
        <CardTitle>Revenue by stores</CardTitle>
        <CardDescription>
          Monthly trends across {keys.length} store
          {keys.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ChartContainer
          config={chartConfig}
          className="h-full w-full min-h-[200px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={safeData}
              margin={{ left: 8, right: 8, top: 8, bottom: 0 }}
            >
              <defs>
                {Object.keys(chartConfig).map((safeKey, i) => (
                  <linearGradient
                    key={safeKey}
                    id={`grad_${safeKey}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={`var(--color-${safeKey})`}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={`var(--color-${safeKey})`}
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                ))}
              </defs>
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
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              {Object.keys(chartConfig).map((safeKey) => (
                <Area
                  key={safeKey}
                  dataKey={safeKey}
                  type="monotone"
                  fill={`url(#grad_${safeKey})`}
                  stroke={`var(--color-${safeKey})`}
                  strokeWidth={2}
                  stackId="a"
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
