// import { getCustomerNotifications } from "@/actions/notification"; // Adjust path as needed
// import { CreateNotificationForm } from "./_components/CreateNotificationForm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCustomerNotifications } from "@/actions/common/notification.action";
import { CreateNotificationForm } from "@/components/admin/notification/CreateNotificationForm";

export default async function AdminNotificationsPage() {
  // We use the existing action. Because the admin creates GLOBAL notifications,
  // they will be returned here as well.
  const { data: notifications, success, message } = await getCustomerNotifications();

  return (
    <div className="container max-w-5xl py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notification Center</h1>
        <p className="text-muted-foreground mt-2">
          Create new global notifications and view previously broadcasted messages.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Create Form Section */}
        <div className="md:col-span-5 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Notification</CardTitle>
              <CardDescription>
                Broadcast a new message to all active customers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateNotificationForm />
            </CardContent>
          </Card>
        </div>

        {/* List Section */}
        <div className="md:col-span-7 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight mb-4">Recent Notifications</h2>
          
          {!success ? (
            <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md">
              Failed to load notifications: {message}
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="text-sm text-muted-foreground italic p-4 border rounded-md border-dashed">
              No notifications have been created yet.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {notifications.map((notification) => (
                <Card key={notification._id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{notification.title}</CardTitle>
                      <Badge variant={notification.type === "GLOBAL" ? "default" : "secondary"}>
                        {notification.type}
                      </Badge>
                    </div>
                    <CardDescription>
                      {new Date(notification.createdAt).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-foreground/90 whitespace-pre-wrap">
                    {notification.message}
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