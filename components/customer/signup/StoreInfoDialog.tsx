"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Phone,
  Users,
  Clock,
  X,
  ChevronRight,
  Mail,
  ExternalLink,
} from "lucide-react";
import { StoreDocument } from "@/types/store/store";
import {
  formatStoreHours,
  getStoreOpenStatus,
  DAY_ORDER,
} from "@/lib/storeInfoUtils";
import { cn } from "@/lib/utils";

type StoreInfoDialogProps = {
  store: StoreDocument | null;
  isOpen: boolean;
  onClose: () => void;
};

export function StoreInfoDialog({
  store,
  isOpen,
  onClose,
}: StoreInfoDialogProps) {
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

  // Google Maps link — works on all platforms, redirects to Apple Maps on iOS Safari automatically
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`;

  // tel: link — opens Phone app on mobile, Facetime/default dialer on desktop
  const telUrl = `tel:${store.mobile?.replace(/\s+/g, "")}`;

  // mailto: link — opens default mail client everywhere
  const mailUrl = `mailto:${store.email}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 gap-0 max-w-md overflow-hidden border-0 shadow-2xl rounded-2xl bg-background">
        {/* Header accent strip */}
        <div className="relative h-1.5 bg-linear-to-r from-primary via-primary/70 to-primary/30" />

        <div className="px-6 pt-5 pb-6 space-y-5">
          {/* Title row */}
          <DialogHeader className="space-y-1">
            <div className="flex items-start justify-between gap-3">
              <DialogTitle className="text-primary text-2xl tracking-tight leading-tight">
                {store.name}
              </DialogTitle>
              <button
                onClick={onClose}
                className="shrink-0 mt-0.5 rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {store.description && (
              <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                {store.description}
              </DialogDescription>
            )}
          </DialogHeader>

          {/* Info rows */}
          <div className="space-y-2">
            {/* Address → Google Maps */}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <InfoRow icon={MapPin} actionIcon={ExternalLink}>
                <span className="text-sm group-hover:text-primary transition-colors underline-offset-4 group-hover:underline">
                  {store.address}
                </span>
              </InfoRow>
            </a>

            {/* Phone → tel: */}
            {store.mobile && (
              <a href={telUrl} className="group block">
                <InfoRow icon={Phone} actionIcon={ExternalLink}>
                  <span className="text-sm group-hover:text-primary transition-colors underline-offset-4 group-hover:underline tabular-nums">
                    {store.mobile}
                  </span>
                </InfoRow>
              </a>
            )}

            {/* Email → mailto: */}
            {store.email && (
              <a href={mailUrl} className="group block">
                <InfoRow icon={Mail} actionIcon={ExternalLink}>
                  <span className="text-sm group-hover:text-primary transition-colors underline-offset-4 group-hover:underline truncate">
                    {store.email}
                  </span>
                </InfoRow>
              </a>
            )}

            {/* Members (not clickable) */}
            <InfoRow icon={Users}>
              <span className="text-sm">
                <span className="font-medium text-foreground">
                  {store.members.length}
                </span>{" "}
                {store.members.length === 1 ? "member" : "members"}
              </span>
            </InfoRow>
          </div>

          {/* Divider */}
          <div className="border-t border-border/60" />

          {/* Hours section */}
          {formattedDays.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  Store Hours
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full border",
                    storeOpen
                      ? "text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800"
                      : "text-rose-600 bg-rose-500/15",
                  )}
                >
                  <span
                    className={cn(
                      "mr-1.5 inline-block h-1.5 w-1.5 rounded-full",
                      storeOpen ? "bg-emerald-500" : "bg-rose-500",
                    )}
                  />
                  {storeOpen
                    ? closesAt
                      ? `Open · Closes ${closesAt}`
                      : "Open"
                    : opensAt
                      ? `Closed · Opens ${opensAt}`
                      : "Closed"}
                </Badge>
              </div>

              {/* Days grid */}
              <div className="rounded-xl border border-border/60 overflow-hidden divide-y divide-border/40">
                {formattedDays.map((day, idx) => {
                  const isToday = idx === todayIndex;
                  return (
                    <div
                      key={day.key}
                      className={cn(
                        "flex items-center justify-between px-3.5 py-2 text-sm transition-colors",
                        isToday
                          ? "bg-primary/5 font-medium"
                          : "hover:bg-muted/40",
                      )}
                    >
                      <div className="flex items-center gap-2 w-20 shrink-0">
                        {isToday && (
                          <ChevronRight className="h-3 w-3 text-primary shrink-0" />
                        )}
                        <span
                          className={cn(
                            isToday ? "text-primary" : "text-muted-foreground",
                          )}
                        >
                          {day.shortLabel}
                        </span>
                      </div>
                      <div className="text-right space-y-0.5">
                        {day.isClosed ? (
                          <span className="text-muted-foreground/70 text-xs italic">
                            Closed
                          </span>
                        ) : day.isOpen24h ? (
                          <span className="text-emerald-600 text-xs font-medium">
                            Open 24 hours
                          </span>
                        ) : (
                          day.formattedRanges.map((range, ri) => (
                            <p
                              key={ri}
                              className="text-xs text-foreground/80 tabular-nums"
                            >
                              {range}
                            </p>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {store.timezone && (
                <p className="text-xs text-muted-foreground/60 text-center">
                  Times shown in {store.timezone.replace("_", " ")}
                </p>
              )}
            </div>
          )}

          {/* Footer */}
          <Button
            onClick={onClose}
            className="w-full rounded-xl h-10 font-semibold shadow-md shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-150"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({
  icon: Icon,
  actionIcon: ActionIcon,
  children,
}: {
  icon: React.ElementType;
  actionIcon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 text-muted-foreground">
      <div className="mt-0.5 shrink-0 rounded-md bg-muted p-1.5 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">{children}</div>
      {ActionIcon && (
        <div className="mt-0.5 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity">
          <ActionIcon className="h-3 w-3" />
        </div>
      )}
    </div>
  );
}
