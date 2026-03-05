import { fmt, fmtShort } from "@/lib/fomatPrice";
import { getMemberSince, getMemberYear } from "@/lib/momberSince";
import { Customer } from "@/types/customer/customer";
import { DollarSign, ShoppingBag, CalendarDays } from "lucide-react";

type Props = {
  customer: Pick<Customer, "monthlyBudget" | "createdAt">;
};

export default function ProfileStats({ customer }: Props) {

  const stats = [
    {
      icon: DollarSign,
      label: "Monthly Budget",
      value: `${fmtShort(customer.monthlyBudget)}`,
      sub: "per month",
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
      ring: "ring-emerald-500/20",
    },
    {
      icon: ShoppingBag,
      label: "Total Orders",
      value: "0",
      sub: "all time",
      color: "text-blue-600",
      bg: "bg-blue-500/10",
      ring: "ring-blue-500/20",
    },
    {
      icon: CalendarDays,
      label: "Member Since",
      value: getMemberYear(customer.createdAt).toString(),
      sub: getMemberSince(customer.createdAt),
      color: "text-amber-600",
      bg: "bg-amber-500/10",
      ring: "ring-amber-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`rounded-2xl border border-border/50 bg-card p-3 sm:p-4 flex flex-col items-center text-center gap-1.5 hover:border-primary/30 transition-colors ring-1 ${s.ring}`}
        >
          <div
            className={`w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center`}
          >
            <s.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <p className="text-sm sm:text-base lg:text-lg font-bold tabular-nums leading-none">
            {s.value}
          </p>
          <div>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-tight font-medium">
              {s.label}
            </p>
            <p className="text-[8px] sm:text-[9px] text-muted-foreground/50 mt-0.5 hidden sm:block">
              {s.sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
