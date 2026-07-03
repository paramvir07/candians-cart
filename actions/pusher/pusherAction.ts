"use server"

import { pusherServer } from "@/lib/pusher/pusher"

export async function ReloadCartpusher() {
  const res = await pusherServer.trigger("cart-channel", "cart-reload", {});
  return { success: true };
}