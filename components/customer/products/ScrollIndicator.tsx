"use client";

import { useEffect, useRef, useState, RefObject } from "react";

export function ScrollIndicator({
  targetRef,
}: {
  targetRef: RefObject<HTMLDivElement | null>;
}) {
  const [scrollPercent, setScrollPercent] = useState(0);
  const [thumbHeight, setThumbHeight] = useState(20);
  const [needsScroll, setNeedsScroll] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const maxScroll = scrollHeight - clientHeight;

      setNeedsScroll(maxScroll > 4);
      setScrollPercent(maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0);
      setThumbHeight(Math.max((clientHeight / scrollHeight) * 100, 10));
    };

    update();
    el.addEventListener("scroll", update);
    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [targetRef]);

  const scrollToPointer = (clientY: number) => {
    const el = targetRef.current;
    const track = trackRef.current;
    if (!el || !track) return;

    const rect = track.getBoundingClientRect();
    const relY = Math.min(Math.max(clientY - rect.top, 0), rect.height);
    const percent = relY / rect.height;

    const maxScroll = el.scrollHeight - el.clientHeight;
    el.scrollTop = percent * maxScroll;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    scrollToPointer(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    scrollToPointer(e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    draggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  if (!needsScroll) return null;

  return (
    <div
      ref={trackRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="group absolute right-0.5 top-1 bottom-1 w-3 cursor-pointer touch-none z-10 flex justify-end"
    >
      <div className="w-[3px] h-full rounded-full bg-transparent group-hover:bg-border/50 transition-colors" />
      <div
        className="absolute right-0 w-[3px] rounded-full bg-primary/30 group-hover:bg-primary transition-colors duration-300"
        style={{
          height: `${thumbHeight}%`,
          top: `${(scrollPercent * (100 - thumbHeight)) / 100}%`,
        }}
      />
    </div>
  );
}