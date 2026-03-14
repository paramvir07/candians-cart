"use client";

import { useState } from "react";
import { StoreDocument } from "@/types/store/store";
import {
  getStoreOpenStatus,
  formatStoreHours,
  DAY_ORDER,
} from "@/lib/storeInfoUtils";
import { MapPin, Mail, Phone, Users, Store, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import StoreProfileClient from "./StoreProfileClient";

type Props = { store: StoreDocument };

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
    <div className="flex items-center gap-3 py-3.5 group">
      <div className="shrink-0 w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all duration-200">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-200 truncate flex-1">
        {children}
      </span>
      {href && (
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-primary/60 group-hover:translate-x-0.5 shrink-0 transition-all duration-200" />
      )}
    </div>
  );

  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block">
      {inner}
    </a>
  ) : inner;
}

export default function ProfileStore({ store }: Props) {
  const [open, setOpen] = useState(false);

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

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`;
  const statusText = isOpen
    ? closesAt ? `Closes ${closesAt}` : "Open Now"
    : opensAt  ? `Opens ${opensAt}` : "Closed";

  const storeRows = [
    { icon: MapPin, href: mapsUrl, content: store.address },
    ...(store.mobile ? [{ icon: Phone, href: `tel:${store.mobile.replace(/\s+/g, "")}`, content: store.mobile }] : []),
    ...(store.email  ? [{ icon: Mail, href: `mailto:${store.email}`, content: store.email }] : []),
    { icon: Users, content: `${store.members.length} member${store.members.length !== 1 ? "s" : ""}` },
  ];

  const StoreBody = () => (
    <>
      {/* Store identity */}
      <div className="px-5 py-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="shrink-0 w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Store className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-bold text-sm text-foreground leading-tight">{store.name}</h2>
              <span className={cn(
                "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full",
                isOpen ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-500",
              )}>
                <span className={cn("w-1.5 h-1.5 rounded-full", isOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500")} />
                {isOpen ? "Open" : "Closed"} · {statusText}
              </span>
            </div>
            {store.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{store.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Detail rows */}
      <div className="px-4 divide-y divide-border/30">
        {storeRows.map((row, i) => (
          <StoreRow key={i} icon={row.icon} href={row.href}>
            {row.content}
          </StoreRow>
        ))}
      </div>

      {/* Hours */}
      <StoreProfileClient
        store={store}
        formattedDays={formattedDays}
        todayIndex={todayIndex}
        isOpen={isOpen}
        closesAt={closesAt}
        opensAt={opensAt}
      />
    </>
  );

  return (
    <div className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-sm">

      {/* ── Mobile: toggle ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/40 transition-colors group lg:hidden"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Store className="h-4 w-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-foreground leading-none">Your Store</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={cn(
                "w-1.5 h-1.5 rounded-full shrink-0",
                isOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
              )} />
              <p className={cn("text-[10px] font-semibold", isOpen ? "text-emerald-600" : "text-rose-500")}>
                {store.name} · {isOpen ? "Open" : "Closed"}
              </p>
            </div>
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
        <div className="border-t border-border/40 lg:hidden animate-in slide-in-from-top-4 fade-in-0 duration-500 ease-out">
          <StoreBody />
        </div>
      )}

      {/* ── Desktop: always open ── */}
      <div className="hidden lg:block">
        <div className="px-5 py-3.5 border-b border-border/40 flex items-center gap-2.5">
          <Store className="h-4 w-4 text-primary" />
          <p className="text-sm font-bold text-foreground">Your Store</p>
        </div>
        <StoreBody />
      </div>
    </div>
  );
}