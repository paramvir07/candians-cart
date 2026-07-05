"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPusherClient } from "@/lib/pusher/pusher-client";
import { toast } from "sonner";

export default function CartReloadListener() {
  const router = useRouter();

  useEffect(() => {
    const pusherClient = getPusherClient();
    const channel = pusherClient.subscribe("cart-channel");

    channel.bind("pusher:subscription_succeeded", () => {
      console.log("✅ Subscribed to cart-channel");
    });

    channel.bind("cart-reload", (data: { message?: string }) => {
      console.log("📥 Received cart-reload event", data);
      if (data?.message) {
        toast.success(data.message);
      }
      router.refresh();
    });

    return () => {
      channel.unbind("cart-reload");
      pusherClient.unsubscribe("cart-channel");
    };
  }, [router]);

  return null;
}