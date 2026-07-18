"use client";

import { Toaster } from "@canadian-cart/ui/ui/sonner";
import { useMediaQuery } from "@canadian-cart/lib/useMediaQuery";

export function ToasterWrapper() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  return <Toaster position={isDesktop ? "top-right" : "bottom-center"} richColors />;
}