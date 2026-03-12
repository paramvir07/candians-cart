import { fmt } from "@/lib/fomatPrice";
import { getMemberSince, getMemberYear } from "@/lib/memberSince";
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
      value: fmt(customer.monthlyBudget),
      sub: "per month",
    },
    {
      icon: ShoppingBag,
      label: "Total Orders",
      value: "0",
      sub: "all time",
    },
    {
      icon: CalendarDays,
      label: "Member Since",
      value: getMemberYear(customer.createdAt).toString(),
      sub: getMemberSince(customer.createdAt),
    },
  ];

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border/40">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
          Overview
        </p>
      </div>

      <div className="grid grid-cols-3 divide-x divide-border/40">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center text-center gap-2 px-3 py-4"
          >
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <s.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-base font-bold tabular-nums leading-none text-foreground">
                {s.value}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium mt-1 leading-tight">
                {s.label}
              </p>
              <p className="text-[9px] text-muted-foreground/50 mt-0.5">
                {s.sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}