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
    ? closesAt
      ? `Open · Closes ${closesAt}`
      : "Open Now"
    : opensAt
      ? `Closed · Opens ${opensAt}`
      : "Closed";

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`;

  return (
    <section>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold mb-2 px-1">
        Your Store
      </p>

      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        {/* Store header */}
        <div className="relative px-4 sm:px-5 lg:px-6 pt-4 sm:pt-5 pb-4 bg-linear-to-br from-primary/10 via-primary/5 to-transparent border-b border-border/40">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-primary/8 blur-2xl pointer-events-none" />

          <div className="relative flex items-start gap-3 sm:gap-4">
            <div className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shadow-sm">
              <Store className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base lg:text-lg leading-tight">
                  {store.name}
                </h2>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap",
                    isOpen
                      ? "bg-emerald-500/15 text-emerald-600"
                      : "bg-rose-500/15 text-rose-600",
                  )}
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      isOpen ? "bg-emerald-500" : "bg-rose-500",
                    )}
                  />
                  {statusText}
                </span>
              </div>
              {store.description && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-2">
                  {store.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Store detail rows */}
        <div className="px-3 sm:px-4 lg:px-5 divide-y divide-border/40">
          <StoreRow icon={MapPin} href={mapsUrl}>
            {store.address}
          </StoreRow>
          {store.mobile && (
            <StoreRow
              icon={Phone}
              href={`tel:${store.mobile.replace(/\s+/g, "")}`}
            >
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

        {/* Client island: hours button + dialog */}
        <StoreProfileClient
          store={store}
          formattedDays={formattedDays}
          todayIndex={todayIndex}
          isOpen={isOpen}
          closesAt={closesAt}
          opensAt={opensAt}
        />
      </div>
    </section>
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
    <div className="flex items-center gap-3 py-2.5 sm:py-3 group">
      <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <span className="text-xs sm:text-sm text-muted-foreground group-hover:text-foreground transition-colors truncate flex-1">
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
