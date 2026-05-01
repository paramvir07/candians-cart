"use client"

import * as React from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { ShoppingCart } from "lucide-react"
import Image from "next/image"
import Logo from "@/components/shared/Logo"

const slides = [
  {
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
    title: "Join Your\nLocal Community",
    sub: "CANDIAN'S CART",
  },
  {
    image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80",
    title: "Fresh Groceries,\nDelivered Fast",
    sub: "CANDIAN'S CART",
  },
  {
    image: "https://images.unsplash.com/photo-1506617564039-2f3b650b7010?w=800&q=80",
    title: "Save More\nEvery Week",
    sub: "CANDIAN'S CART",
  },
]

const autoplayPlugin = Autoplay({ delay: 3000, stopOnInteraction: false })

export function SignupCarousel() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    if (!api) return
    setCurrent(api.selectedScrollSnap())
    api.on("select", () => setCurrent(api.selectedScrollSnap()))
  }, [api])

  return (
    <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-2xl">
      <Carousel
        setApi={setApi}
        plugins={[autoplayPlugin]}
        opts={{ loop: true }}
        className="h-full [&>div]:h-full"
      >
        <CarouselContent className="h-full ml-0 [&>div]:h-full select-none">
          {slides.map((slide, index) => (
            <CarouselItem key={index} className="h-full pl-0">
              <div className="relative h-full w-full flex flex-col min-h-[575px]">

                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 z-[1]" />

                <div className="flex-1" />

                <div className="relative z-10 px-6 pb-6">
                  <p className="text-white/60 text-xs font-medium mb-1.5 tracking-widest uppercase">
                    {slide.sub}
                  </p>
                  <h2 className="text-white text-2xl font-bold whitespace-pre-line mb-5">
                    {slide.title}
                  </h2>
                  <div className="flex items-center gap-2">
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => api?.scrollTo(i)}
                        className="h-[3px] cursor-pointer rounded-full transition-all duration-300"
                        style={{
                          width: i === current ? "28px" : "10px",
                          background: i === current ? "white" : "rgba(255,255,255,0.35)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}