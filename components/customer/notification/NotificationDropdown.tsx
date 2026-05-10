"use client";

import { useState } from "react";
import { BellIcon, CheckCheck } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

// We define the type locally to avoid importing from a "use server" file
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
  unreadCount,
  notifications,
}: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);

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