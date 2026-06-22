import { getCustomerStats } from "@/actions/admin/analytics/getCustomerStats.action";
import MainOverviewUser from "@/components/shared/users/MainOverviewUser";
import UserList from "@/components/shared/users/UserList";
import { ShieldCheck, Users, Activity, WalletCards } from "lucide-react";

export const dynamic = "force-dynamic";

const ImmigrationCustomersPage = async () => {
  const stats = await getCustomerStats();

  return (
    <main className="min-h-screen bg-muted/20">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Header / Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
                <ShieldCheck className="h-7 w-7" />
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Immigration Dashboard
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Customer Management Overview
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  View all customers across every store, monitor activity, track
                  new registrations, and review customer budget insights from
                  one central dashboard.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[430px]">
              <div className="rounded-2xl border border-border bg-background/70 p-4 shadow-sm backdrop-blur-sm">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Total Customers
                  </p>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold tabular-nums text-foreground">
                  {stats.totalUsers.toLocaleString()}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-background/70 p-4 shadow-sm backdrop-blur-sm">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Active Users
                  </p>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold tabular-nums text-foreground">
                  {stats.activeUsers.toLocaleString()}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-background/70 p-4 shadow-sm backdrop-blur-sm">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Avg Budget
                  </p>
                  <WalletCards className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold tabular-nums text-foreground">
                  ${stats.avgMonthlyBudget.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Customer List */}
        <section className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Customer List
            </h2>
            <p className="text-sm text-muted-foreground">
              All customers across every store.
            </p>
          </div>

          <UserList userRole="immigration" />
        </section>
      </div>
    </main>
  );
};

export default ImmigrationCustomersPage;
