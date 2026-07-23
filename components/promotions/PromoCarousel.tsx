"use client";

import { useEffect, useRef, useState, Children, isValidElement } from "react";

interface PromoCarouselProps {
  children: React.ReactNode;
  /** Auto-advance interval in ms. Set to 0 to disable auto-play. */
  intervalMs?: number;
  className?: string;
}

/**
 * Lightweight carousel for stacking promo cards (e.g. $500 grand prize +
 * $50 draw) into one swipeable, auto-advancing strip with dot indicators.
 * No external deps — plain pointer events for drag/swipe.
 */
export default function PromoCarousel({
  children,
  intervalMs = 5000,
  className = "",
}: PromoCarouselProps) {
  const slides = Children.toArray(children).filter(isValidElement);
  const count = slides.length;

  const [active, setActive] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [paused, setPaused] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const widthRef = useRef(0);

  // ── Auto-play ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (count <= 1 || intervalMs <= 0 || paused || isDragging) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % count);
    }, intervalMs);
    return () => clearInterval(id);
  }, [count, intervalMs, paused, isDragging]);

  // ── Drag / swipe handlers ────────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent) => {
    if (count <= 1) return;
    setIsDragging(true);
    setPaused(true);
    startXRef.current = e.clientX;
    widthRef.current = containerRef.current?.offsetWidth ?? 1;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setDragOffset(e.clientX - startXRef.current);
  };

  const endDrag = () => {
    if (!isDragging) return;
    const threshold = widthRef.current * 0.18;

    if (dragOffset < -threshold && active < count - 1) {
      setActive((prev) => prev + 1);
    } else if (dragOffset > threshold && active > 0) {
      setActive((prev) => prev - 1);
    }

    setIsDragging(false);
    setDragOffset(0);
    // Resume auto-play a moment after interaction
    setTimeout(() => setPaused(false), 1500);
  };

  if (count === 0) return null;

  const dragPct = widthRef.current ? (dragOffset / widthRef.current) * 100 : 0;
  const translatePct = -active * 100 + dragPct;

  return (
    <div className={`w-full ${className}`}>
      <div
        ref={containerRef}
        className="relative overflow-hidden touch-pan-y select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
      >
        <div
          ref={trackRef}
          className="flex"
          style={{
            transform: `translateX(${translatePct}%)`,
            transition: isDragging
              ? "none"
              : "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              className="w-full shrink-0 px-0.5 cursor-grab active:cursor-grabbing"
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      {count > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setActive(i);
                setPaused(true);
                setTimeout(() => setPaused(false), 3000);
              }}
              aria-label={`Go to slide ${i + 1}`}
              className="p-1 -m-1"
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-300 ${
                  i === active
                    ? "w-5 bg-gradient-to-r from-amber-400 to-amber-500"
                    : "w-1.5 bg-amber-200"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
