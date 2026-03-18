"use client";

import {
  Pie,
  PieChart,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fmt } from "@/lib/fomatPrice";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-background border border-border rounded-xl px-4 py-3 shadow-lg text-sm">
      <p className="font-semibold text-foreground mb-1">{d.store}</p>
      <p className="text-muted-foreground">{d.orders} orders</p>
      {d.revenue && (
        <p className="text-muted-foreground">{fmt(d.revenue)} revenue</p>
      )}
    </div>
  );
}

function CustomLegend({ payload }: any) {
  if (!payload?.length) return null;
  return (
    <div className="flex flex-col gap-1.5 px-2">
      {payload.map((entry: any, i: number) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground truncate">
              {entry.value}
            </span>
          </div>
          <span className="font-semibold text-foreground shrink-0">
            {entry.payload?.orders ?? 0}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ChartPieSimple({
  data,
}: {
  data: { store: string; orders: number; revenue?: number }[];
}) {
  if (!data.length) {
    return (
      <Card className="flex flex-col overflow-hidden lg:h-full">
        <CardHeader className="items-center pb-4 shrink-0">
          <CardTitle>Orders completed</CardTitle>
          <CardDescription>By store</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="w-20 h-20 rounded-full border-4 border-dashed border-muted mx-auto mb-3" />
            <p className="text-sm font-medium">No completed orders yet</p>
            <p className="text-xs mt-1">
              Data will appear once orders are completed
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalOrders = data.reduce((s, d) => s + d.orders, 0);

  return (
    <Card className="flex flex-col overflow-hidden lg:h-full">
      <CardHeader className="items-center pb-2 shrink-0">
        <CardTitle>Orders by store</CardTitle>
        <CardDescription>{totalOrders} total completed orders</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 flex flex-col items-center justify-center gap-4 pb-4">
        <div className="w-full" style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={data}
                dataKey="orders"
                nameKey="store"
                cx="50%"
                cy="50%"
                innerRadius="40%"
                outerRadius="75%"
                paddingAngle={data.length > 1 ? 3 : 0}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Custom legend below */}
        <div className="w-full max-w-[240px] space-y-1.5">
          {data.map((d, i) => (
            <div
              key={d.store}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                  }}
                />
                <span className="text-muted-foreground truncate">
                  {d.store}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="font-semibold text-foreground">
                  {d.orders}
                </span>
                <span className="text-muted-foreground">
                  {Math.round((d.orders / totalOrders) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
