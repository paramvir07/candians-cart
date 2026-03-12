"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MapPin, Phone, Clock, Mail, ExternalLink, X, ChevronDown } from "lucide-react";
import { StoreDocument } from "@/types/store/store";
import { formatStoreHours, getStoreOpenStatus, DAY_ORDER } from "@/lib/storeInfoUtils";
import { cn } from "@/lib/utils";
import Image from "next/image";

type StoreInfoDialogProps = {
  store: StoreDocument | null;
  isOpen: boolean;
  onClose: () => void;
};

const STORE_IMAGES = [
  "https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=800&q=80",
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
  "https://images.unsplash.com/photo-1506617564039-2f3b650b7010?w=800&q=80",
  "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80",
];

export function StoreInfoDialog({ store, isOpen, onClose }: StoreInfoDialogProps) {
  const [hoursOpen, setHoursOpen] = useState(false);

  if (!store) return null;

  const formattedDays = store.hours ? formatStoreHours(store.hours) : [];
  const { isOpen: storeOpen, closesAt, opensAt } = store.hours
    ? getStoreOpenStatus(store.hours, store.timezone)
    : { isOpen: false, closesAt: null, opensAt: null };

  const today = new Date()
    .toLocaleDateString("en-US", { weekday: "short" })
    .toLowerCase()
    .slice(0, 3);
  const todayIndex = DAY_ORDER.indexOf(today as any);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`;
  const telUrl = `tel:${store.mobile?.replace(/\s+/g, "")}`;
  const mailUrl = `mailto:${store.email}`;
  const heroImage = STORE_IMAGES[store.name.charCodeAt(0) % STORE_IMAGES.length];

  const statusLabel = storeOpen
    ? closesAt ? `Open · Closes ${closesAt}` : "Open Now"
    : opensAt ? `Closed · Opens ${opensAt}` : "Closed";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 gap-0 max-w-[360px] w-[calc(100%-2rem)] overflow-hidden border border-border shadow-xl rounded-2xl bg-card">

        {/* HERO */}
        <div className="relative w-full h-36 shrink-0">
          <Image src={heroImage} alt={store.name} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-2.5 right-2.5 rounded-full p-1.5 bg-black/25 backdrop-blur-sm text-white/80 hover:bg-black/45 hover:text-white transition-all"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="absolute bottom-0 left-0 right-0 px-4 pb-3.5">
            <h2 className="text-white text-2xl font-bold tracking-tight leading-tight">
              {store.name}
            </h2>
            {store.description && (
              <p className="text-white/60 text-sm mt-0.5 line-clamp-1">{store.description}</p>
            )}
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-3 divide-x divide-border border-b border-border bg-muted/20">
          <StatCell label="Members" value={String(store.members.length)} />
          <StatCell
            label="Status"
            value={storeOpen ? "Open" : "Closed"}
            valueClass={storeOpen ? "text-emerald-600" : "text-rose-500"}
          />
          <StatCell
            label={storeOpen ? "Closes" : "Opens"}
            value={storeOpen ? (closesAt ?? "—") : (opensAt ?? "—")}
          />
        </div>

        {/* INFO ROWS */}
        <div className="px-4 py-3 space-y-1.5">

          {/* Address */}
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="group block">
            <InfoRow
              icon={MapPin}
              action={<ExternalLink className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors shrink-0" />}
            >
              <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                {store.address}
              </span>
            </InfoRow>
          </a>

          {/* Phone + Email */}
          {(store.mobile || store.email) && (
            <div className={cn("grid gap-1.5", store.mobile && store.email ? "grid-cols-2" : "grid-cols-1")}>
              {store.mobile && (
                <a href={telUrl} className="group">
                  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors border border-transparent hover:border-border">
                    <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Phone</p>
                      <p className="text-xs font-semibold text-foreground tabular-nums truncate">{store.mobile}</p>
                    </div>
                  </div>
                </a>
              )}
              {store.email && (
                <a href={mailUrl} className="group">
                  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors border border-transparent hover:border-border">
                    <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Email</p>
                      <p className="text-xs font-semibold text-foreground truncate">{store.email}</p>
                    </div>
                  </div>
                </a>
              )}
            </div>
          )}

          {/* Hours collapsible */}
          {formattedDays.length > 0 && (
            <div className="rounded-xl border border-border overflow-hidden">

              {/* Toggle */}
              <button
                onClick={() => setHoursOpen((p) => !p)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Hours</span>
                  <span className={cn(
                    "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                    storeOpen
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
                  )}>
                    {statusLabel}
                  </span>
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-300 ease-in-out",
                  hoursOpen && "rotate-180"
                )} />
              </button>

              {/* Animated expand */}
              <div className={cn(
                "grid transition-all duration-300 ease-in-out",
                hoursOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}>
                <div className="overflow-hidden">
                  <div className="divide-y divide-border/40">
                    {formattedDays.map((day, idx) => {
                      const isToday = idx === todayIndex;
                      return (
                        <div
                          key={day.key}
                          className={cn(
                            "flex items-center justify-between px-3 py-1.5 text-xs",
                            isToday ? "bg-primary/5" : "bg-card"
                          )}
                        >
                          <span className={cn(
                            "font-medium w-10",
                            isToday ? "text-primary font-semibold" : "text-muted-foreground"
                          )}>
                            {day.shortLabel}
                          </span>
                          <span className="text-foreground/80 tabular-nums">
                            {day.isClosed ? "Closed" : day.isOpen24h ? "24 hours" : day.formattedRanges.join(", ")}
                          </span>
                        </div>
                      );
                    })}
                    {store.timezone && (
                      <p className="text-[10px] text-muted-foreground/40 text-center py-1.5">
                        {store.timezone.replace("_", " ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-4 pb-4">
          <button
            onClick={onClose}
            className="w-full h-11 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-sm shadow-primary/20"
          >
            Done
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
}

function StatCell({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex flex-col items-center py-2.5 px-2">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">{label}</p>
      <p className={cn("text-sm font-bold", valueClass ?? "text-foreground")}>{value}</p>
    </div>
  );
}

function InfoRow({
  icon: Icon, action, children,
}: {
  icon: React.ElementType;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-muted/40">
      <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">{children}</div>
      {action}
    </div>
  );
}