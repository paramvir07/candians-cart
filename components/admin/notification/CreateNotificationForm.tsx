"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner"; // Or use shadcn's useToast

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// import { createGlobalNotification } from "@/actions/notification"; // Adjust path as needed

import { 
  createPublicNotificationSchema, 
  type CreatePublicNotificationInput 
} from "@/zod/schemas/notification/notification";
import { createGlobalNotification } from "@/actions/common/notification.action";

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
      // Convert standard values to FormData to match your Server Action signature
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("message", values.message);

      const response = await createGlobalNotification(formData);

      if (response.success) {
        toast.success(response.message || "Notification created successfully.");
        form.reset();
        router.refresh(); // Refresh the page to update the server-rendered list
      } else {
        toast.error(response.message || "Failed to create notification.");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="System Maintenance..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Please be advised that the system will undergo maintenance..." 
                  className="min-h-[120px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? "Publishing..." : "Publish Global Notification"}
        </Button>
      </form>
    </Form>
  );
}