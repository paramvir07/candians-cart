"use client";

import { Progress } from "@/components/ui/progress";
import { useState, useEffect, useRef } from "react";
import { SubsidizedPopup } from "./SubsidizedPopup";

const getFibBracketFrom21 = (value: number) => {
  let a = 13;
  let b = 21;
  while (b < value) {
    const next = a + b;
    a = b;
    b = next;
  }
  return { prev: a, current: b };
};

const shownMilestones = new Set<number>();

const ProgressBarCart = ({
  total,
  customerId,
}: {
  total: number;
  customerId?: string;
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const amount = total / 100;
  const { prev, current } = getFibBracketFrom21(amount);

  const progressValue =
    current === prev
      ? 100
      : Math.min(((amount - prev) / (current - prev)) * 100, 100);

  const prevRef = useRef<number>(prev);

  useEffect(() => {
    if (prev !== prevRef.current && prev >= 21 && !shownMilestones.has(prev)) {
      shownMilestones.add(prev);
      setDialogOpen(true);
    }
    prevRef.current = prev;
  }, [prev]);

  return (
    <>
      <div className="flex items-center w-full gap-4">
        <Progress value={progressValue} className="w-full" />
        <p className="text-sm font-semibold tabular-nums whitespace-nowrap text-gray-900">
          ${current}
        </p>
      </div>

      <SubsidizedPopup
        customerId={customerId}
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
};

export default ProgressBarCart;