"use client"

import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"
import { useState } from "react"

const categories = [
  { name: "Dosa", slug: "dosa" },
  { name: "Biryani", slug: "biryani" },
  { name: "Idli", slug: "idli" },
  { name: "Vada", slug: "vada" },
  { name: "Momos", slug: "momos" },
  { name: "Parotta", slug: "parotta" },
  { name: "Noodles", slug: "noodles" },
  { name: "Pancake", slug: "pancake" },
  { name: "Sandwich", slug: "sandwich" },
]

export function WhatsOnYourMind() {
  const { data: session } = useSession()
  const greeting = session?.user?.name ? `${session.user.name}, What's on your mind?` : "What's on your mind?"
  const [api, setApi] = useState<CarouselApi | null>(null)

  return (
    <section className="max-w-300 mx-auto">
      <div className="flex items-center justify-between gap-4 mb-5 sm:mb-7">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          {greeting}
        </h2>
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="Previous categories"
            onClick={() => api?.scrollPrev()}
            className="h-10 w-10 rounded-full bg-muted hover:bg-muted/80 text-foreground shadow-none"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="Next categories"
            onClick={() => api?.scrollNext()}
            className="h-10 w-10 rounded-full bg-muted hover:bg-muted/80 text-foreground shadow-none"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        setApi={setApi}
      >
        <CarouselContent className="-ml-3 sm:-ml-4">
          {categories.map((cat) => (
            <CarouselItem
              key={cat.slug}
              className="basis-[36%] sm:basis-[24%] md:basis-[18%] lg:basis-[calc(100%/7)] xl:basis-[12.5%] pl-3 sm:pl-4"
            >
              <Link
                href={`/search?q=${cat.slug}`}
                className="flex flex-col items-center gap-2 sm:gap-3 group/cat"
              >
                <div className="relative w-full aspect-square rounded-full overflow-hidden bg-muted/30 transition-transform duration-300 group-hover/cat:scale-105">
                  <Image
                    src="/categories/idli.png"
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 36vw, (max-width: 768px) 24vw, (max-width: 1024px) 18vw, 14.28vw"
                    className="object-contain scale-110 p-4 sm:p-5 md:p-6"
                  />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-center text-muted-foreground group-hover/cat:text-foreground transition-colors leading-tight">
                  {cat.name}
                </span>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  )
}
