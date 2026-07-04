"use server"

import { pusherServer } from "@/lib/pusher/pusher"

export async function ReloadCartpusher(message?: string) {
  await pusherServer.trigger("cart-channel", "cart-reload", { message });
  return { success: true, message };
}