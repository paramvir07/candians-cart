import CustomerOrders from "@/components/shared/users/orders/CustomerOrders";
import { getOrderStats } from "@/actions/admin/orders/getOrderStats.action";
import {
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  DollarSign,
  Package,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

function formatCents(cents: number) {
  return (
    "$" +
    (cents / 100).toLocaleString("en-CA", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  highlight = false,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
  accent: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`group relative min-h-[170px] overflow-hidden rounded-2xl border p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        highlight
          ? "border-violet-300/70 bg-gradient-to-br from-violet-50 via-white to-white"
          : "border-border bg-card"
      }`}
    >
      <div
        className={`absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-10 blur-2xl ${accent}`}
      />

      <div className={`absolute bottom-0 left-0 h-1.5 w-full ${accent}`} />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {label}
            </p>

            <p className="mt-2 text-sm leading-5 text-muted-foreground">
              {sub}
            </p>
          </div>

          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${accent} text-white shadow-sm`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-6 flex items-end justify-between gap-3">
          <p className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
            {value}
          </p>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

const ImmigrationOrders = async () => {
  const stats = await getOrderStats();

  return (
    <main className="min-h-screen bg-muted/20">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="relative p-6 sm:p-8">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-20 left-1/3 h-44 w-44 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Immigration Dashboard
                  </p>
                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    All Orders Overview
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                    Track platform-wide orders, pending requests, completed
                    orders, and total revenue from one place.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Stats */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard
            label="Daily Orders"
            value={stats.dailyOrders}
            sub="Created today"
            icon={CalendarDays}
            accent="bg-blue-500"
          />

          <StatCard
            label="Monthly"
            value={stats.monthlyOrders}
            sub="This month"
            icon={Calendar}
            accent="bg-emerald-500"
          />

          <StatCard
            label="Total Orders"
            value={stats.totalOrders.toLocaleString()}
            sub="All time"
            icon={Package}
            accent="bg-amber-500"
          />

          <StatCard
            label="Completed"
            value={stats.totalOrders.toLocaleString()}
            sub="Successfully done"
            icon={CheckCircle2}
            accent="bg-teal-500"
          />

          <StatCard
            label="Revenue"
            value={formatCents(stats.totalRevenue)}
            sub="Total revenue"
            icon={DollarSign}
            accent="bg-violet-500"
            highlight
          />
        </section>

        {/* Orders */}
        <section className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <CustomerOrders allOrders={true} immigrationRole={true} />
        </section>
      </div>
    </main>
  );
};

export default ImmigrationOrders;
