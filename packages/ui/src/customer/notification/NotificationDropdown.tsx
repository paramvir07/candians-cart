"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  BellIcon,
  CheckCheck,
  Megaphone,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Zap,
} from "lucide-react";
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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getTypeStyle(type: string): {
  icon: React.ReactNode;
  bg: string;
  text: string;
} {
  switch (type?.toLowerCase()) {
    case "announcement":
      return {
        icon: <Megaphone className="w-3.5 h-3.5" strokeWidth={1.8} />,
        bg: "bg-blue-500/10",
        text: "text-blue-500",
      };
    case "success":
      return {
        icon: <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.8} />,
        bg: "bg-emerald-500/10",
        text: "text-emerald-500",
      };
    case "warning":
      return {
        icon: <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.8} />,
        bg: "bg-amber-500/10",
        text: "text-amber-500",
      };
    case "error":
      return {
        icon: <XCircle className="w-3.5 h-3.5" strokeWidth={1.8} />,
        bg: "bg-red-500/10",
        text: "text-red-500",
      };
    case "update":
      return {
        icon: <Zap className="w-3.5 h-3.5" strokeWidth={1.8} />,
        bg: "bg-purple-500/10",
        text: "text-purple-500",
      };
    default:
      return {
        icon: <Info className="w-3.5 h-3.5" strokeWidth={1.8} />,
        bg: "bg-muted",
        text: "text-muted-foreground",
      };
  }
}

export function NotificationDropdown({
  unreadCount: initialUnreadCount,
  notifications: initialNotifications,
}: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

  const pendingReadIds = useRef<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const markAsRead = useCallback(async (id: string) => {
    if (pendingReadIds.current.has(id)) return;
    pendingReadIds.current.add(id);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, status: "READ" } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    await markNotificationsAsRead([id]).catch(console.error);
  }, []);

  useEffect(() => {
    if (!open) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = (entry.target as HTMLElement).dataset.notificationId;
          const status = (entry.target as HTMLElement).dataset.status;
          if (id && status === "UNREAD") markAsRead(id);
        });
      },
      { threshold: 0.5 }
    );
    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [open, markAsRead]);

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
        {/* Header */}
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
              {notifications.map((notification) => {
                const { icon, bg, text } = getTypeStyle(notification.type);
                return (
                  <div
                    key={notification._id}
                    ref={notification.status === "UNREAD" ? observeItem : undefined}
                    data-notification-id={notification._id}
                    data-status={notification.status}
                    className={`relative flex gap-3 px-4 py-3.5 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors ${
                      notification.status === "UNREAD" ? "bg-primary/5" : ""
                    }`}
                  >
                    {/* Unread dot */}
                    {notification.status === "UNREAD" && (
                      <span className="absolute right-3 top-4 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}

                    {/* Type icon bubble */}
                    <div
                      className={`mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${bg} ${text}`}
                    >
                      {icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="mb-0.5">
                        <span
                          className={`text-[13px] leading-snug ${
                            notification.status === "UNREAD"
                              ? "font-semibold text-foreground"
                              : "font-medium text-foreground/80"
                          }`}
                        >
                          {notification.title}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>
                      <span className="text-[10px] text-muted-foreground/60 mt-1 block tabular-nums">
                        {timeAgo(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer — mark all read */}
        {unreadCount > 0 && (
          <div className="border-t border-border px-4 py-2.5 flex justify-end">
            <button
              onClick={async () => {
                const ids = notifications
                  .filter((n) => n.status === "UNREAD")
                  .map((n) => n._id);
                setNotifications((prev) =>
                  prev.map((n) => ({ ...n, status: "READ" as const }))
                );
                setUnreadCount(0);
                await markNotificationsAsRead(ids).catch(console.error);
              }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all as read
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}