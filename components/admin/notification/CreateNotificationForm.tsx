"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  createPublicNotificationSchema,
  type CreatePublicNotificationInput,
} from "@/zod/schemas/notification/notification";
import { createGlobalNotification } from "@/actions/common/notification.action";

import { Bell, Globe, Send, Loader2, Info } from "lucide-react";

export function CreateNotificationForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreatePublicNotificationInput>({
    resolver: zodResolver(createPublicNotificationSchema),
    defaultValues: {
      title: "",
      message: "",
    },
  });

  function onSubmit(values: CreatePublicNotificationInput) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("message", values.message);

      const response = await createGlobalNotification(formData);

      if (response.success) {
        toast.success(response.message || "Notification created successfully.");
        form.reset();
        router.refresh();
      } else {
        toast.error(response.message || "Failed to create notification.");
      }
    });
  }

  const messageValue = form.watch("message");
  const charCount = messageValue?.length ?? 0;

  return (
    <div className="w-full space-y-4">
      {/* Scope badge */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Bell className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-foreground">Global Notification</p>
          <p className="text-xs text-muted-foreground">Broadcast a message to all users</p>
        </div>
        <Badge
          variant="secondary"
          className="flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs"
        >
          <Globe className="h-3 w-3" />
          All Users
        </Badge>
      </div>

      <Separator />

      {/* Warning banner */}
      <div className="flex items-start gap-2 rounded-lg border bg-muted/50 px-3 py-2.5">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          This notification will be immediately visible to{" "}
          <span className="font-semibold text-foreground">all users</span> across
          the platform. Review your message carefully before publishing.
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-xs font-medium">Title</FormLabel>
                  <span className="text-xs text-muted-foreground">Required</span>
                </div>
                <FormControl>
                  <Input
                    placeholder="e.g. Scheduled Maintenance on May 20th"
                    className="h-9 text-sm placeholder:text-muted-foreground/50"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Keep it short and descriptive — users see this first.
                </FormDescription>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-xs font-medium">Message</FormLabel>
                  <span
                    className={`text-xs tabular-nums transition-colors ${
                      charCount > 400
                        ? "text-destructive"
                        : charCount > 300
                        ? "text-amber-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {charCount} chars
                  </span>
                </div>
                <FormControl>
                  <Textarea
                    placeholder="Please be advised that the system will undergo scheduled maintenance on Tuesday from 2:00–4:00 AM UTC. Services may be temporarily unavailable during this window."
                    className="min-h-[120px] resize-none text-sm leading-relaxed placeholder:text-muted-foreground/50"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Include dates, times, and any action users need to take.
                </FormDescription>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => form.reset()}
              disabled={isPending}
            >
              Clear
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="flex h-8 items-center gap-1.5 px-4 text-xs font-medium"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Publishing…
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Publish Notification
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}