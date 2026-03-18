"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Package } from "lucide-react";

function EmptyCard({
  title,
  description,
  fullHeight,
  icon: Icon,
}: {
  title: string;
  description: string;
  fullHeight?: boolean;
  icon: React.ElementType;
}) {
  return (
    <Card className={fullHeight ? "h-full flex flex-col" : ""}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center py-12">
        <div className="text-center text-muted-foreground">
          <Icon className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium">No data yet</p>
          <p className="text-xs mt-1">Will populate as orders come in</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function TopProducts({
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
      <EmptyCard
        title="Top 5 Products"
        description="Monthly sales quantity"
        fullHeight={fullHeight}
        icon={Package}
      />
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
        <CardTitle>Top 5 Products</CardTitle>
        <CardDescription>Monthly sales quantity</CardDescription>
      </CardHeader>
      <CardContent className={fullHeight ? "flex-1 min-h-0" : ""}>
        <ChartContainer
          config={chartConfig}
          className={
            fullHeight ? "h-full w-full min-h-[200px]" : "w-full min-h-[200px]"
          }
        >
          <BarChart data={safeData} margin={{ left: 4, right: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              tickFormatter={(v) => v.slice(0, 3)}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {Object.keys(chartConfig).map((safeKey) => (
              <Bar
                key={safeKey}
                dataKey={safeKey}
                fill={`var(--color-${safeKey})`}
                radius={[3, 3, 0, 0]}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 text-sm pt-0">
        <p className="text-xs text-muted-foreground">
          Top-selling products compared month over month
        </p>
      </CardFooter>
    </Card>
  );
}
