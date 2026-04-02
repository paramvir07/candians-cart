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
  "https://cdn.discordapp.com/attachments/1265793460825227377/1488347615941885972/IMG-20260330-WA0001.jpg?ex=69cc733b&is=69cb21bb&hm=7400263a90142d84da4ee9c94a9401fa331488061e49489cc2ae2d964a85eb12&",
  "https://cdn.discordapp.com/attachments/1265793460825227377/1488347619523690496/IMG-20260330-WA0002.jpg?ex=69cc733c&is=69cb21bc&hm=a1d3ee91fcc697ef332c5467d9f88aaf3f5c23311aaf5070299b003485d31a02&",
  "https://cdn.discordapp.com/attachments/1265793460825227377/1488347635583811665/IMG-20260330-WA0003.jpg?ex=69cc7340&is=69cb21c0&hm=aedc772e605ed4a7e4e49a4e1e42f11f21615c783fb304dbefcbfc3a7e79c95b&",
  "https://cdn.discordapp.com/attachments/1265793460825227377/1488347641237733496/IMG-20260330-WA0004.jpg?ex=69cc7341&is=69cb21c1&hm=fdb4583c8e2a10e748e7d27a5a76873cd1b5688aa9da9366e62f7c17c50264f7&",
  "https://cdn.discordapp.com/attachments/1265793460825227377/1488347648581963816/IMG-20260330-WA0005.jpg?ex=69cc7343&is=69cb21c3&hm=4831e3cfd8165b427af4c07e3a5df98dd42c060365bc60d4674debddc1429a19&",
];

interface CustomerAdvertisementsProps {
  adImages?: string[];
  delay?: number;
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
      className={cn(
        "w-full px-3 py-4 sm:px-5 sm:py-6 md:px-8 md:py-8 lg:px-10 lg:py-10",
        className,
      )}
    >
      <Carousel
  setApi={setApi}
  plugins={[plugin.current]}
  opts={{ loop: true, align: "start" }}
  className="w-full"
>
  <CarouselContent className="ml-0">
    {adImages.map((src, index) => (
      <CarouselItem key={`${src}-${index}`} className="pl-0">
  <div
  className="relative w-full h-full xs:h-full sm:h-full md:h-65 lg:h-73 xl:h-75 overflow-hidden rounded-xl"
  style={{
    background: "linear-gradient(to bottom, #f7f8fa 0%, #f5f5f5 60%, #d0d0d0 100%)",
  }}
>
    {/* MAIN IMAGE */}
    <img
      src={src}
      alt={`Advertisement ${index + 1}`}
      className="w-full h-full object-contain z-20"
      loading={index === 0 ? "eager" : "lazy"}
      referrerPolicy="no-referrer"
      onError={(e) => {
        const slide = (e.currentTarget as HTMLImageElement).closest(
          "[data-slot='carousel-item']",
        ) as HTMLElement | null;
        if (slide) slide.style.display = "none";
      }}
    />

    {/* ADS BADGE */}
    <div className="absolute top-2 left-2 z-30 bg-black/50 backdrop-blur-sm text-white text-[10px] sm:text-xs px-2 py-1 rounded-md font-medium">
      Sponsored
    </div>
  </div>
</CarouselItem>
    ))}
  </CarouselContent>

  {adImages.length > 1 && (
    <>
      <CarouselPrevious className="left-2 h-7 w-7 opacity-70 hover:opacity-100 transition-opacity z-30" />
      <CarouselNext className="right-2 h-7 w-7 opacity-70 hover:opacity-100 transition-opacity z-30" />
    </>
  )}
</Carousel>

      {count > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              onClick={() => api?.scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === current
                  ? "w-4 bg-primary"
                  : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}