import { Customer } from "@/types/customer/customer";
import { Mail, MapPin, Phone, User, ChevronRight } from "lucide-react";

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
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <div className="flex items-center gap-3 py-3 sm:py-3.5 group">
      <div className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground/50 font-semibold">
          {label}
        </p>
        <p className="text-xs sm:text-sm font-medium truncate mt-0.5 group-hover:text-primary transition-colors">
          {value}
        </p>
      </div>
      {href && (
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-primary/60 shrink-0 transition-colors" />
      )}
    </div>
  );

  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block">
      {inner}
    </a>
  ) : (
    inner
  );
}

export default function ProfileContact({ customer }: Props) {
  return (
    <section>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold mb-2 px-1">
        Contact Info
      </p>
      <div className="rounded-2xl border border-border/50 bg-card px-3 sm:px-4 lg:px-5 divide-y divide-border/40">
        <ContactRow icon={User} label="Full Name" value={customer.name} />
        <ContactRow
          icon={Mail}
          label="Email Address"
          value={customer.email}
        />
        <ContactRow
          icon={MapPin}
          label="Home Address"
          value={`${customer.address}, ${customer.city}, ${customer.province}`}
        />
        <ContactRow
          icon={Phone}
          label="Mobile Number"
          value={customer.mobile}
        />
      </div>
    </section>
  );
}
