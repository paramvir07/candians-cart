import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Bell,
  Users,
  Clock,
  ArrowLeft,
  CheckCircle2,
  InboxIcon,
} from "lucide-react";
import Link from "next/link";
import { NotificationReadReceipt } from "@/actions/common/notification.action";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Props {
  notification: {
    title: string;
    message: string;
    type: string;
    createdAt: string;
  };
  receipts: NotificationReadReceipt[];
}

export function NotificationReceiptsView({ notification, receipts }: Props) {
  const formattedDate = new Date(notification.createdAt).toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  return (
    <div className="w-full min-h-screen px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      {/* Back button + header */}
      <div className="mb-6 sm:mb-8">
        <Link href="/admin/notifications">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 mb-4 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Notifications
          </Button>
        </Link>

        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {notification.title}
              </h1>
              <Badge
                variant={
                  notification.type === "GLOBAL" ? "default" : "secondary"
                }
                className="rounded-full px-2.5 py-0.5 text-xs shrink-0"
              >
                {notification.type}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Message body */}
        <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 mb-2">
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {notification.message}
          </p>
        </div>

        <Separator className="mt-5" />
      </div>

      {/* Read receipts section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">Read by</h2>
          <span className="ml-1 inline-flex items-center justify-center bg-primary text-primary-foreground text-[11px] font-bold rounded-full w-5 h-5">
            {receipts.length}
          </span>
        </div>

        {receipts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-14 text-center">
            <InboxIcon className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No one has read this notification yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {receipts.map((r) => (
              <Card
                key={r.customerId}
                className="border border-border/60 shadow-sm"
              >
                <CardHeader className="pb-1 pt-4 px-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar monogram */}
                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-black text-primary">
                      {/* {r.customerName.charAt(0).toUpperCase()} */}
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={`https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(r.customerName)}`}
                          className="rounded-3xl"
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold rounded-3xl">
                          {r.customerName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-sm font-semibold text-foreground truncate">
                        {r.customerName}
                      </CardTitle>
                      <CardDescription className="text-xs truncate">
                        {r.customerEmail}
                      </CardDescription>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 ml-auto" />
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-3 pt-1">
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Read{" "}
                    {new Date(r.readAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
