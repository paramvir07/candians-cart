"use client";

import { useRef, ReactNode } from "react";
import { ScrollIndicator } from "./ScrollIndicator";

export function ScrollableItemsList({
  children,
  maxHeight,
  className,
}: {
  children: ReactNode;
  maxHeight: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      <div
        ref={ref}
        className={`no-scrollbar overflow-y-auto ${className ?? ""}`}
        style={{ maxHeight }}
      >
        {children}
      </div>
      <ScrollIndicator targetRef={ref} />
    </div>
  );
}