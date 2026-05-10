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

const DEFAULT_AD_IMAGES: string[] = [
  "https://ik.imagekit.io/h7w5h0hou/ads/ashirwad%20food%20banner.png?updatedAt=1778039959719",
  "https://ik.imagekit.io/h7w5h0hou/ads/samosa%20time%20%20banner.png?updatedAt=1778039959632",
  "https://ik.imagekit.io/h7w5h0hou/ads/hi%20peak%20banner.png?updatedAt=1778039959482",
  "https://ik.imagekit.io/h7w5h0hou/ads/gaba%20tire%20banner%20no%201%20abbotsford.png?updatedAt=1778039959403",
  "https://ik.imagekit.io/h7w5h0hou/ads/surry%20wheel%20banner.png?updatedAt=1778039958756",
  "https://ik.imagekit.io/h7w5h0hou/ads/ashoke%20banner.png?updatedAt=1778039959115",
  "https://ik.imagekit.io/h7w5h0hou/ads/GIANS%20GROUP%20BANNER-01.jpg?updatedAt=1778039959022",
  "https://ik.imagekit.io/h7w5h0hou/ads/GABA%20%20TIRES%20Banner%20.png?updatedAt=1778039959289",
  "https://ik.imagekit.io/h7w5h0hou/ads/mid%20valley%20insurance%20banner.png?updatedAt=1778039958825",
  "https://ik.imagekit.io/h7w5h0hou/ads/banner.png?updatedAt=1778039958795",
  "https://ik.imagekit.io/h7w5h0hou/ads/ABBY%20WEDDING%20BANNER.png?updatedAt=1778039957957",
  "https://ik.imagekit.io/h7w5h0hou/ads/Banner%20(5).png?updatedAt=1778039958072",
  "https://ik.imagekit.io/h7w5h0hou/ads/THIND%20IMMIGRATION_%20BANNER%20(1).png?updatedAt=1778039958884",
  "https://ik.imagekit.io/h7w5h0hou/ads/InsureBC%20Banner.png?updatedAt=1778039958274",
  "https://ik.imagekit.io/h7w5h0hou/ads/InsureBC%20Banner.png?updatedAt=1778039958274",
  "https://ik.imagekit.io/h7w5h0hou/ads/TANDOORI%20TADKA%20BANNER.png?updatedAt=1778039958465",
  "https://ik.imagekit.io/h7w5h0hou/ads/A1%20%20Decoration.%20Canada_%20BANNER.png?updatedAt=1778039958243",
  "https://ik.imagekit.io/h7w5h0hou/ads/Real%20Handmade%20Schnitzelz%20banner%20(1).png?updatedAt=1778039957560",
  "https://ik.imagekit.io/h7w5h0hou/ads/Brinder%20Gill%20final%20.png?updatedAt=1778039957378",
  "https://ik.imagekit.io/h7w5h0hou/ads/Banner%20(2).png?updatedAt=1778039956861"
];

interface CustomerAdvertisementsProps {
  adImages?: string[];
  delay?: number;
  className?: string;
  /**
   * Max height of the entire banner in pixels (default 600).
   * Max width is auto-derived from the 8:3 aspect ratio.
   * Pass e.g. maxHeight={300} for a compact strip.
   */
  maxHeight?: number;
}

export default function CustomerAdvertisements({
  adImages = DEFAULT_AD_IMAGES,
  delay = 3500,
  className,
  maxHeight = 600,
}: CustomerAdvertisementsProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  // Derive max width from the 8:3 aspect ratio so both dimensions scale together
  const maxWidth = Math.round((maxHeight * 8) / 3);

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
    <div
      className={cn("w-full mx-auto", className)}
      style={{ maxWidth, padding: undefined }}
    >
      <div className="px-3 py-3 sm:px-5 sm:py-4 md:px-6 md:py-5 lg:px-8 lg:py-6">
        {/* ── Carousel ── */}
        <div className="relative w-full group">
          <Carousel
            setApi={setApi}
            plugins={[plugin.current]}
            opts={{ loop: true, align: "center" }}
            className="w-full"
          >
            <CarouselContent className="ml-0">
              {adImages.map((src, index) => (
                <CarouselItem key={`${src}-${index}`} className="pl-0">
                  <div
                    className="relative w-full overflow-hidden rounded-xl shadow-md"
                    style={{
                      aspectRatio: "8 / 3",
                      maxHeight,
                    }}
                  >
                    {/* Blurred bg fill */}
                    <img
                      src={src}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-40 pointer-events-none select-none"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 pointer-events-none z-10" />

                    {/* Main banner image */}
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

                    {/* Sponsored badge */}
                    <div className="absolute top-2 left-2 z-30 flex items-center gap-1 bg-black/45 backdrop-blur-md text-white/90 text-[9px] sm:text-[10px] md:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md font-medium tracking-wide select-none">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      Sponsored
                    </div>

                    {/* Slide counter */}
                    {count > 1 && (
                      <div className="absolute top-2 right-2 z-30 bg-black/40 backdrop-blur-md text-white/80 text-[9px] sm:text-[10px] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md font-medium tabular-nums select-none">
                        {current + 1} / {count}
                      </div>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Prev / Next */}
            {adImages.length > 1 && (
              <>
                <CarouselPrevious
                  className={cn(
                    "absolute left-2 top-1/2 -translate-y-1/2 z-30",
                    "h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9",
                    "bg-black/40 hover:bg-black/65 border-0 text-white backdrop-blur-sm",
                    "transition-all duration-200",
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

        {/* Dot indicators */}
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
    </div>
  );
}

// "use client";

// import * as React from "react";
// import Autoplay from "embla-carousel-autoplay";
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselNext,
//   CarouselPrevious,
// } from "@/components/ui/carousel";
// import { type CarouselApi } from "@/components/ui/carousel";
// import { cn } from "@/lib/utils";

// interface CustomerAdvertisementsProps {
//   delay?: number;
//   className?: string;
//   maxHeight?: number;
// }

// export default function CustomerAdvertisements({
//   delay = 3500,
//   className,
//   maxHeight = 600,
// }: CustomerAdvertisementsProps) {
//   const [api, setApi] = React.useState<CarouselApi>();
//   const [current, setCurrent] = React.useState(0);
//   const [count, setCount] = React.useState(0);
//   const [adImages, setAdImages] = React.useState<string[]>([]);
//   const [loading, setLoading] = React.useState(true);

//   const maxWidth = Math.round((maxHeight * 8) / 3);

//   const plugin = React.useRef(
//     Autoplay({ delay, stopOnInteraction: false, stopOnMouseEnter: true }),
//   );

//   React.useEffect(() => {
//     fetch("/api/ads")
//       .then((r) => r.json())
//       .then(({ urls }) => setAdImages(urls ?? []))
//       .catch(() => setAdImages([]))
//       .finally(() => setLoading(false));
//   }, []);

//   React.useEffect(() => {
//     if (!api) return;
//     setCount(api.scrollSnapList().length);
//     setCurrent(api.selectedScrollSnap());
//     api.on("select", () => setCurrent(api.selectedScrollSnap()));
//   }, [api]);

//   if (loading) {
//     return (
//       <div className={cn("w-full mx-auto", className)} style={{ maxWidth }}>
//         <div className="px-3 py-3 sm:px-5 sm:py-4">
//           <div
//             className="w-full rounded-xl bg-muted animate-pulse"
//             style={{ aspectRatio: "8 / 3", maxHeight }}
//           />
//         </div>
//       </div>
//     );
//   }

//   if (!adImages.length) return null;

//   return (
//     <div className={cn("w-full mx-auto", className)} style={{ maxWidth }}>
//       <div className="px-3 py-3 sm:px-5 sm:py-4 md:px-6 md:py-5 lg:px-8 lg:py-6">
//         <div className="relative w-full group">
//           <Carousel
//             setApi={setApi}
//             plugins={[plugin.current]}
//             opts={{ loop: true, align: "center" }}
//             className="w-full"
//           >
//             <CarouselContent className="ml-0">
//               {adImages.map((src, index) => (
//                 <CarouselItem key={`${src}-${index}`} className="pl-0">
//                   <div
//                     className="relative w-full overflow-hidden rounded-xl shadow-md"
//                     style={{ aspectRatio: "8 / 3", maxHeight }}
//                   >
//                     <img
//                       src={src}
//                       alt=""
//                       aria-hidden="true"
//                       className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-40 pointer-events-none select-none"
//                       loading="lazy"
//                       referrerPolicy="no-referrer"
//                     />
//                     <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 pointer-events-none z-10" />
//                     <img
//                       src={src}
//                       alt={`Advertisement ${index + 1}`}
//                       className="absolute inset-0 w-full h-full object-contain z-20 transition-transform duration-700 ease-out group-hover:scale-[1.015]"
//                       loading={index === 0 ? "eager" : "lazy"}
//                       referrerPolicy="no-referrer"
//                       onError={(e) => {
//                         const slide = (e.currentTarget as HTMLImageElement)
//                           .closest("[data-slot='carousel-item']") as HTMLElement | null;
//                         if (slide) slide.style.display = "none";
//                       }}
//                     />
//                     <div className="absolute top-2 left-2 z-30 flex items-center gap-1 bg-black/45 backdrop-blur-md text-white/90 text-[9px] sm:text-[10px] md:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md font-medium tracking-wide select-none">
//                       <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
//                       Sponsored
//                     </div>
//                     {count > 1 && (
//                       <div className="absolute top-2 right-2 z-30 bg-black/40 backdrop-blur-md text-white/80 text-[9px] sm:text-[10px] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md font-medium tabular-nums select-none">
//                         {current + 1} / {count}
//                       </div>
//                     )}
//                   </div>
//                 </CarouselItem>
//               ))}
//             </CarouselContent>

//             {adImages.length > 1 && (
//               <>
//                 <CarouselPrevious
//                   className={cn(
//                     "absolute left-2 top-1/2 -translate-y-1/2 z-30",
//                     "h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9",
//                     "bg-black/40 hover:bg-black/65 border-0 text-white backdrop-blur-sm",
//                     "transition-all duration-200",
//                     "opacity-80 sm:opacity-0 sm:group-hover:opacity-100 shadow-lg",
//                   )}
//                 />
//                 <CarouselNext
//                   className={cn(
//                     "absolute right-2 top-1/2 -translate-y-1/2 z-30",
//                     "h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9",
//                     "bg-black/40 hover:bg-black/65 border-0 text-white backdrop-blur-sm",
//                     "transition-all duration-200",
//                     "opacity-80 sm:opacity-0 sm:group-hover:opacity-100 shadow-lg",
//                   )}
//                 />
//               </>
//             )}
//           </Carousel>
//         </div>

//         {count > 1 && (
//           <div className="flex justify-center items-center gap-1.5 mt-2.5">
//             {Array.from({ length: count }).map((_, i) => (
//               <button
//                 key={i}
//                 onClick={() => api?.scrollTo(i)}
//                 aria-label={`Go to slide ${i + 1}`}
//                 className={cn(
//                   "h-1.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
//                   i === current
//                     ? "w-5 bg-primary"
//                     : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/55",
//                 )}
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }