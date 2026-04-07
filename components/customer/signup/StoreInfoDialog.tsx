"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  MapPin,
  Phone,
  Clock,
  Mail,
  ExternalLink,
  X,
  ChevronDown,
} from "lucide-react";
import { StoreDocument } from "@/types/store/store";
import {
  formatStoreHours,
  getStoreOpenStatus,
  DAY_ORDER,
} from "@/lib/storeInfoUtils";
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

export function StoreInfoDialog({
  store,
  isOpen,
  onClose,
}: StoreInfoDialogProps) {
  const [hoursOpen, setHoursOpen] = useState(false);

  if (!store) return null;

  const formattedDays = store.hours ? formatStoreHours(store.hours) : [];
  const {
    isOpen: storeOpen,
    closesAt,
    opensAt,
  } = store.hours
    ? getStoreOpenStatus(store.hours, store.timezone)
    : { isOpen: false, closesAt: null, opensAt: null };

  const today = new Date()
    .toLocaleDateString("en-US", { weekday: "short" })
    .toLowerCase()
    .slice(0, 3);

  const todayIndex = DAY_ORDER.indexOf(today as any);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    store.address,
  )}`;
  const telUrl = `tel:${store.mobile?.replace(/\s+/g, "")}`;
  const mailUrl = `mailto:${store.email}`;
  const heroImage =
    STORE_IMAGES[store.name.charCodeAt(0) % STORE_IMAGES.length];

  const statusLabel = storeOpen
    ? closesAt
      ? `Open · Closes ${closesAt}`
      : "Open now"
    : opensAt
      ? `Closed · Opens ${opensAt}`
      : "Closed";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "p-0 gap-0 overflow-hidden rounded-2xl border border-border bg-card shadow-xl",
          "w-[calc(100vw-1.25rem)] sm:w-[calc(100vw-2rem)]",
          "max-w-[340px] sm:max-w-[360px] max-h-screen",
        )}
      >
        <div className="flex flex-col">
          {/* HERO */}
          <div className="relative h-32 w-full shrink-0 sm:h-36">
            <Image
              src={heroImage}
              alt={store.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <button
              onClick={onClose}
              className="absolute right-2.5 top-2.5 rounded-full bg-black/30 p-1.5 text-white/85 backdrop-blur-sm transition-all hover:bg-black/50 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="absolute bottom-0 left-0 right-0 px-3.5 pb-3">
              <h2 className="line-clamp-2 text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl">
                {store.name}
              </h2>
              {store.description && (
                <p className="mt-0.5 line-clamp-1 text-xs text-white/70 sm:text-sm">
                  {store.description}
                </p>
              )}
            </div>
          </div>

          {/* BODY */}
          <div className="flex-1 overflow-hidden">
            {/* STATS */}
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

            {/* INFO */}
            <div className="space-y-1.5 px-3.5 py-3">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <InfoRow
                  icon={MapPin}
                  action={
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground/35 transition-colors group-hover:text-muted-foreground/70" />
                  }
                >
                  <span className="break-words text-sm text-foreground transition-colors group-hover:text-primary">
                    {store.address}
                  </span>
                </InfoRow>
              </a>

              {(store.mobile || store.email) && (
                <div
                  className={cn(
                    "grid gap-1.5",
                    store.mobile && store.email
                      ? "grid-cols-1 sm:grid-cols-2"
                      : "grid-cols-1",
                  )}
                >
                  {store.mobile && (
                    <a href={telUrl} className="group">
                      <ContactCard
                        icon={Phone}
                        label="Phone"
                        value={store.mobile}
                      />
                    </a>
                  )}

                  {store.email && (
                    <a href={mailUrl} className="group">
                      <ContactCard
                        icon={Mail}
                        label="Email"
                        value={store.email}
                      />
                    </a>
                  )}
                </div>
              )}

              {formattedDays.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-border">
                  <button
                    onClick={() => setHoursOpen((p) => !p)}
                    className="flex w-full items-center justify-between bg-muted/30 px-3 py-2.5 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <span className="text-sm font-semibold text-foreground">
                        Hours
                      </span>

                      <span
                        className={cn(
                          "max-w-[140px] truncate rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                          storeOpen
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-600",
                        )}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300",
                        hoursOpen && "rotate-180",
                      )}
                    />
                  </button>

                  <div
                    className={cn(
                      "grid transition-all duration-300 ease-in-out",
                      hoursOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0",
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="no-scrollbar max-h-[180px] overflow-y-auto divide-y divide-border/40">
                        {formattedDays.map((day, idx) => {
                          const isToday = idx === todayIndex;

                          return (
                            <div
                              key={day.key}
                              className={cn(
                                "flex items-start justify-between gap-3 px-3 py-2 text-xs",
                                isToday ? "bg-primary/5" : "bg-card",
                              )}
                            >
                              <span
                                className={cn(
                                  "w-10 shrink-0 font-medium",
                                  isToday
                                    ? "font-semibold text-primary"
                                    : "text-muted-foreground",
                                )}
                              >
                                {day.shortLabel}
                              </span>

                              <span className="min-w-0 break-words text-right text-foreground/80 tabular-nums">
                                {day.isClosed
                                  ? "Closed"
                                  : day.isOpen24h
                                    ? "24 hours"
                                    : day.formattedRanges.join(", ")}
                              </span>
                            </div>
                          );
                        })}

                        {store.timezone && (
                          <p className="py-1.5 text-center text-[10px] text-muted-foreground/50">
                            {store.timezone.replace("_", " ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div className="shrink-0 px-3.5 pb-3.5">
            <button
              onClick={onClose}
              className="h-10 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Done
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatCell({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col items-center px-2 py-2">
      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className={cn("text-sm font-bold", valueClass ?? "text-foreground")}>
        {value}
      </p>
    </div>
  );
}

function ContactCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-transparent bg-muted/50 px-3 py-2.5 transition-colors group-hover:border-border group-hover:bg-muted">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-xs font-semibold text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  action,
  children,
}: {
  icon: React.ElementType;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-muted/40 px-3 py-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">{children}</div>
      {action}
    </div>
  );
}
