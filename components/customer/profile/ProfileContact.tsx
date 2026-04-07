"use client";

import { useState } from "react";
import { Customer } from "@/types/customer/customer";
import {
  Mail,
  MapPin,
  Phone,
  User,
  ChevronDown,
  ContactRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  customer: Pick<
    Customer,
    "name" | "email" | "address" | "city" | "province" | "mobile"
  >;
};

function ContactRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  const inner = (
    <div className="flex items-center gap-3 py-3.5 group">
      <div className="shrink-0 w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all duration-200">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-semibold leading-none">
          {label}
        </p>
        <p className="text-sm font-semibold text-foreground truncate mt-1 transition-colors duration-200">
          {value}
        </p>
      </div>
    </div>
  );

  return inner;
}

export default function ProfileContact({ customer }: Props) {
  const [open, setOpen] = useState(false);

  const rows = [
    { icon: User, label: "Full Name", value: customer.name },
    { icon: Mail, label: "Email Address", value: customer.email },
    {
      icon: MapPin,
      label: "Home Address",
      value: `${customer.address}, ${customer.city}, ${customer.province}`,
    },
    { icon: Phone, label: "Mobile Number", value: customer.mobile },
  ];

  return (
    <div className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-sm">
      {/* ── Mobile: toggle ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/40 transition-colors group lg:hidden"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <ContactRound className="h-4 w-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-foreground leading-none">
              Contact Info
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {customer.email}
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-500 ease-out",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="border-t border-border/40 px-4 divide-y divide-border/30 lg:hidden animate-in slide-in-from-top-4 fade-in-0 duration-500 ease-out">
          {rows.map((row) => (
            <ContactRow key={row.label} {...row} />
          ))}
        </div>
      )}

      {/* ── Desktop: always open ── */}
      <div className="hidden lg:block">
        <div className="px-5 py-3.5 border-b border-border/40 flex items-center gap-2.5">
          <ContactRound className="h-4 w-4 text-primary" />
          <p className="text-sm font-bold text-foreground">Contact Info</p>
        </div>
        <div className="px-4 divide-y divide-border/30">
          {rows.map((row) => (
            <ContactRow key={row.label} {...row} />
          ))}
        </div>
      </div>
    </div>
  );
}
