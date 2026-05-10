"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { BellIcon, CheckCheck } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { markNotificationsAsRead } from "@/actions/common/notification.action";

export interface DropdownNotification {
  _id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  status: "READ" | "UNREAD";
}

interface NotificationDropdownProps {
  unreadCount: number;
  notifications: DropdownNotification[];
}

export function NotificationDropdown({
  unreadCount: initialUnreadCount,
  notifications: initialNotifications,
}: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

  // Track which IDs are already queued to be marked read (avoid duplicate calls)
  const pendingReadIds = useRef<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const markAsRead = useCallback(async (id: string) => {
    if (pendingReadIds.current.has(id)) return;
    pendingReadIds.current.add(id);

    // Optimistically update UI
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, status: "READ" } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    // Persist to DB — fire and forget, errors don't need to revert UI
    await markNotificationsAsRead([id]).catch(console.error);
  }, []);

  // Build the observer once; re-build whenever markAsRead or open changes
  useEffect(() => {
    if (!open) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = (entry.target as HTMLElement).dataset.notificationId;
          const status = (entry.target as HTMLElement).dataset.status;
          if (id && status === "UNREAD") {
            markAsRead(id);
          }
        });
      },
      { threshold: 0.5 } // 50% of the item must be visible
    );

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [open, markAsRead]);

  // Callback ref: attach/detach observer as each item mounts/unmounts
  const observeItem = useCallback((el: HTMLDivElement | null) => {
    if (!el || !observerRef.current) return;
    observerRef.current.observe(el);
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center hover:bg-secondary/80 active:scale-[0.97] transition-all outline-none">
          <BellIcon className="w-[16px] h-[16px] text-primary" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-black text-primary-foreground border-2 border-background">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0 mr-4 mt-2" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount === 0 && notifications.length > 0 && (
            <div className="flex items-center text-xs text-muted-foreground gap-1">
              <CheckCheck className="w-3 h-3" /> All caught up
            </div>
          )}
        </div>

        <ScrollArea className="h-[350px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center text-sm text-muted-foreground">
              <BellIcon className="w-8 h-8 mb-2 opacity-20" />
              <p>No notifications yet.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  ref={notification.status === "UNREAD" ? observeItem : undefined}
                  data-notification-id={notification._id}
                  data-status={notification.status}
                  className={`flex flex-col gap-1 p-4 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors ${
                    notification.status === "UNREAD" ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium leading-none">
                      {notification.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                      {new Date(notification.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3 mt-1">
                    {notification.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}