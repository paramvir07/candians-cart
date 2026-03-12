// components/customer/profile/ProfileStore.tsx  (Server Component)
import { StoreDocument } from "@/types/store/store";
import {
  getStoreOpenStatus,
  formatStoreHours,
  DAY_ORDER,
} from "@/lib/storeInfoUtils";
import { MapPin, Mail, Phone, Users, Store, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import StoreProfileClient from "./StoreProfileClient";

type Props = { store: StoreDocument };

export default function ProfileStore({ store }: Props) {
  if (!store) return null;

  const { isOpen, closesAt, opensAt } = store.hours
    ? getStoreOpenStatus(store.hours, store.timezone)
    : { isOpen: false, closesAt: null, opensAt: null };

  const formattedDays = store.hours ? formatStoreHours(store.hours) : [];

  const today = new Date()
    .toLocaleDateString("en-US", { weekday: "short" })
    .toLowerCase()
    .slice(0, 3);
  const todayIndex = DAY_ORDER.indexOf(today as any);

  const statusText = isOpen
    ? closesAt ? `Open · Closes ${closesAt}` : "Open Now"
    : opensAt  ? `Closed · Opens ${opensAt}` : "Closed";

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`;

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      {/* Section label */}
      <div className="px-5 py-3.5 border-b border-border/40">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
          Your Store
        </p>
      </div>

      {/* Store identity */}
      <div className="px-5 py-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="shrink-0 w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Store className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-bold text-sm text-foreground leading-tight">
                {store.name}
              </h2>
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full",
                  isOpen
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full", isOpen ? "bg-emerald-500" : "bg-rose-500")} />
                {statusText}
              </span>
            </div>
            {store.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {store.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Detail rows */}
      <div className="px-4 divide-y divide-border/40">
        <StoreRow icon={MapPin} href={mapsUrl}>{store.address}</StoreRow>
        {store.mobile && (
          <StoreRow icon={Phone} href={`tel:${store.mobile.replace(/\s+/g, "")}`}>
            {store.mobile}
          </StoreRow>
        )}
        {store.email && (
          <StoreRow icon={Mail} href={`mailto:${store.email}`}>
            {store.email}
          </StoreRow>
        )}
        <StoreRow icon={Users}>
          {store.members.length} member{store.members.length !== 1 ? "s" : ""}
        </StoreRow>
      </div>

      {/* Hours toggle — client island */}
      <StoreProfileClient
        store={store}
        formattedDays={formattedDays}
        todayIndex={todayIndex}
        isOpen={isOpen}
        closesAt={closesAt}
        opensAt={opensAt}
      />
    </div>
  );
}

function StoreRow({
  icon: Icon,
  href,
  children,
}: {
  icon: React.ElementType;
  href?: string;
  children: React.ReactNode;
}) {
  const inner = (
    <div className="flex items-center gap-3 py-3 group">
      <div className="shrink-0 w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors truncate flex-1">
        {children}
      </span>
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