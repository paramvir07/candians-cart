"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { type CarouselApi } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   Banner native ratio: 1600 × 600  →  8 / 3
   We honour this ratio on every breakpoint so
   the image is never cropped or distorted.
   ───────────────────────────────────────────── */

const DEFAULT_AD_IMAGES: string[] = [
  "https://ik.imagekit.io/h7w5h0hou/IMG-20260330-WA0001.webp",
  "https://ik.imagekit.io/h7w5h0hou/IMG-20260330-WA0002.webp",
  "https://ik.imagekit.io/h7w5h0hou/IMG-20260330-WA0004%20(1).webp",
  "https://ik.imagekit.io/h7w5h0hou/IMG-20260330-WA0003.webp",
  "https://ik.imagekit.io/h7w5h0hou/IMG-20260330-WA0005.webp",
];

interface CustomerAdvertisementsProps {
  /** Override the default ad image URLs */
  adImages?: string[];
  /** Auto-play interval in ms (default 3 500) */
  delay?: number;
  /** Extra classes on the root wrapper */
  className?: string;
}

export default function CustomerAdvertisements({
  adImages = DEFAULT_AD_IMAGES,
  delay = 3500,
  className,
}: CustomerAdvertisementsProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);

  const plugin = React.useRef(
    Autoplay({ delay, stopOnInteraction: false, stopOnMouseEnter: true }),
  );

  React.useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  if (!adImages || adImages.length === 0) return null;

  return (
    /*
      Root wrapper:
      - Full width, no horizontal overflow
      - Subtle outer spacing that scales with screen size
      - Max width capped so the banner never becomes absurdly tall on ultrawide
    */
    <div
      className={cn(
        "w-full max-w-screen-2xl mx-auto",
        "px-3 py-3 sm:px-5 sm:py-4 md:px-6 md:py-5 lg:px-8 lg:py-6 ",
        className,
      )}
    >
      {/* ── Carousel ─────────────────────────────── */}
      <div
        className="relative w-full group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Carousel
          setApi={setApi}
          plugins={[plugin.current]}
          opts={{ loop: true, align: "center" }}
          className="w-full"
        >
          <CarouselContent className="ml-0">
            {adImages.map((src, index) => (
              <CarouselItem key={`${src}-${index}`} className="pl-0">
                {/*
                  Aspect-ratio wrapper:
                  Banner is 1600 × 600 → ratio = 8/3 ≈ 37.5 %
                  padding-bottom trick keeps it perfect on every screen.

                  On very small phones (< 400 px) the banner would be only
                  ~133 px tall — still perfectly readable for a wide banner.
                */}
                <div
                  className="relative w-full overflow-hidden rounded-xl shadow-md"
                  style={{ paddingBottom: "37.5%" }} /* 600/1600 = 37.5 % */
                >
                  {/* ── Blurred background fill (covers letterbox areas) */}
                  <img
                    src={src}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-40 pointer-events-none select-none"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />

                  {/* ── Gradient overlay on bg ── */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 pointer-events-none z-10" />

                  {/* ── Main banner image ── */}
                  <img
                    src={src}
                    alt={`Advertisement ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-contain z-20 transition-transform duration-700 ease-out group-hover:scale-[1.015]"
                    loading={index === 0 ? "eager" : "lazy"}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const slide = (
                        e.currentTarget as HTMLImageElement
                      ).closest("[data-slot='carousel-item']") as HTMLElement | null;
                      if (slide) slide.style.display = "none";
                    }}
                  />

                  {/* ── Sponsored badge ── */}
                  <div className="absolute top-2 left-2 z-30 flex items-center gap-1 bg-black/45 backdrop-blur-md text-white/90 text-[9px] sm:text-[10px] md:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md font-medium tracking-wide select-none">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Sponsored
                  </div>

                  {/* ── Slide counter (top-right) ── */}
                  {count > 1 && (
                    <div className="absolute top-2 right-2 z-30 bg-black/40 backdrop-blur-md text-white/80 text-[9px] sm:text-[10px] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md font-medium tabular-nums select-none">
                      {current + 1} / {count}
                    </div>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* ── Prev / Next — visible on hover (desktop) or always on touch ── */}
          {adImages.length > 1 && (
            <>
              <CarouselPrevious
                className={cn(
                  "absolute left-2 top-1/2 -translate-y-1/2 z-30",
                  "h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9",
                  "bg-black/40 hover:bg-black/65 border-0 text-white backdrop-blur-sm",
                  "transition-all duration-200",
                  // Always show on mobile, fade in on desktop hover
                  "opacity-80 sm:opacity-0 sm:group-hover:opacity-100",
                  "shadow-lg",
                )}
              />
              <CarouselNext
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 z-30",
                  "h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9",
                  "bg-black/40 hover:bg-black/65 border-0 text-white backdrop-blur-sm",
                  "transition-all duration-200",
                  "opacity-80 sm:opacity-0 sm:group-hover:opacity-100",
                  "shadow-lg",
                )}
              />
            </>
          )}
        </Carousel>
      </div>

      {/* ── Dot indicators ─────────────────────── */}
      {count > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-2.5">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              onClick={() => api?.scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                i === current
                  ? "w-5 bg-primary"
                  : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/55",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}