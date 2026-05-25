"use client";

import { Toaster } from "@/components/ui/sonner";
import { useMediaQuery } from "@/lib/useMediaQuery";

export function ToasterWrapper() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  return <Toaster position={isDesktop ? "top-right" : "bottom-center"} richColors />;
}