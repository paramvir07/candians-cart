import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MainOverviewUserProps {
  totalUsers: number;
  totalUsersChange: string;
  totalUsersUp: boolean;
  newUsersThisMonth: number;
  newUsersChange: string;
  newUsersUp: boolean;
  activeUsers: number;
  activeUsersChange: string;
  activeUsersUp: boolean;
  avgMonthlyBudget: number;
  avgBudgetChange: string;
  avgBudgetUp: boolean;
}

const MainOverviewUser = ({
  totalUsers,
  totalUsersChange,
  totalUsersUp,
  newUsersThisMonth,
  newUsersChange,
  newUsersUp,
  activeUsers,
  activeUsersChange,
  activeUsersUp,
  avgMonthlyBudget,
  avgBudgetChange,
  avgBudgetUp,
}: MainOverviewUserProps) => {
  const now = new Date();
  const label = `From ${new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1,
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })} – ${new Date(now.getFullYear(), now.getMonth(), 0).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "2-digit",
      year: "numeric",
    },
  )}`;

  const stats = [
    {
      label: "Total Users",
      value: totalUsers.toLocaleString(),
      change: `${totalUsersChange}%`,
      isUp: totalUsersUp,
    },
    {
      label: "New Users",
      value: newUsersThisMonth.toLocaleString(),
      change: `${newUsersChange}%`,
      isUp: newUsersUp,
    },
    {
      label: "Active Users",
      value: activeUsers.toLocaleString(),
      change: `${activeUsersChange}%`,
      isUp: activeUsersUp,
    },
    {
      label: "Avg Monthly Budget",
      value: `$${avgMonthlyBudget.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      change: `${avgBudgetChange}%`,
      isUp: avgBudgetUp,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((item) => (
        <Card key={item.label}>
          <CardContent className="pt-6 pb-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{item.label}</p>
              <div
                className={`flex items-center gap-1 text-xs ${
                  item.isUp
                    ? "text-green-600 bg-green-100 p-1 rounded-sm"
                    : "text-red-600 bg-red-100 p-1 rounded-sm"
                }`}
              >
                {item.isUp ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {item.change}
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{item.value}</p>
          </CardContent>
          <CardFooter className="pb-6">
            <p className="text-xs text-muted-foreground">{label}</p>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default MainOverviewUser;
