import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getCustomerNotifications } from "@/actions/common/notification.action";
import { CreateNotificationForm } from "@/components/admin/notification/CreateNotificationForm";
import { Bell, AlertCircle, InboxIcon } from "lucide-react";

export default async function AdminNotificationsPage() {
  const {
    data: notifications,
    success,
    message,
  } = await getCustomerNotifications();

  return (
    <div className="w-full min-h-screen px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Notification Center
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Create new global notifications and view previously broadcasted messages.
        </p>
        <Separator className="mt-5" />
      </div>

      {/* Two-column layout — stacks on mobile, side-by-side on lg+ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">

        {/* LEFT — Create Form */}
        <div className="w-full">
          <Card className="w-full border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Create Notification
              </CardTitle>
              <CardDescription className="text-xs">
                Broadcast a new message to all active customers.
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <CreateNotificationForm />
            </CardContent>
          </Card>
        </div>

        {/* RIGHT — Recent Notifications */}
        <div className="w-full">
          <h2 className="mb-4 text-base font-semibold tracking-tight text-foreground sm:text-lg">
            Recent Notifications
          </h2>

          {!success ? (
            <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">
                Failed to load notifications: {message}
              </p>
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-12 text-center">
              <InboxIcon className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No notifications have been created yet.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {notifications.map((notification) => (
                <Card
                  key={notification._id}
                  className="w-full border shadow-sm transition-colors hover:bg-muted/30"
                >
                  <CardHeader className="pb-2 pt-4">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-sm font-semibold leading-snug text-foreground">
                        {notification.title}
                      </CardTitle>
                      <Badge
                        variant={
                          notification.type === "GLOBAL" ? "default" : "secondary"
                        }
                        className="shrink-0 rounded-full px-2.5 py-0.5 text-xs"
                      >
                        {notification.type}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      {new Date(notification.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4 pt-0">
                    <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                      {notification.message}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}