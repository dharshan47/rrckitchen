"use client"

import Link from "next/link"
import Image from "next/image"
import { Star, Clock } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"
import { KitchenWishlistButton } from "@/components/kitchen/kitchen-wishlist-button"
import type { RelatedKitchen } from "@/actions/catalog/home-data"

interface Props {
  kitchenName: string
  kitchens: RelatedKitchen[]
}

export function RelatedKitchensCarousel({ kitchenName, kitchens }: Props) {
  if (!kitchens.length) return null

  const displayKitchens = kitchens.slice(0, 8)

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
          Related to {kitchenName}
        </h2>
        <div className="hidden md:flex items-center gap-3">
          <CarouselPrevious className="static translate-y-0 h-9 w-9 rounded-full bg-gray-100 border-none text-foreground hover:bg-gray-200 transition-colors shadow-none flex items-center justify-center" />
          <CarouselNext className="static translate-y-0 h-9 w-9 rounded-full bg-gray-100 border-none text-foreground hover:bg-gray-200 transition-colors shadow-none flex items-center justify-center" />
        </div>
      </div>
      
      <div className="relative px-1">
        <Carousel opts={{ align: "start", dragFree: true }}>
          <CarouselContent className="-ml-4 sm:-ml-6">
            {displayKitchens.map((kitchen) => (
              <CarouselItem key={kitchen.id} className="pl-4 sm:pl-6 basis-[80%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                <Link href={`/kitchen/${kitchen.slug}`} className="block group hover:scale-[0.97] active:scale-95 transition-all duration-300">
                  <div className="relative aspect-16/10 rounded-[24px] overflow-hidden bg-muted shadow-sm">
                    {kitchen.imageUrl ? (
                      <Image
                        src={kitchen.imageUrl}
                        alt={kitchen.displayName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/10 to-muted">
                        <span className="text-muted-foreground/30 text-3xl font-black">{kitchen.displayName.charAt(0)}</span>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-80" />
                    
                    <div className="absolute bottom-3 left-3 right-3 z-10 px-1">
                       <h3 className="text-white text-base sm:text-lg font-black truncate drop-shadow-md leading-tight">
                          {kitchen.displayName}
                       </h3>
                       <div className="flex items-center gap-2 mt-1">
                          {kitchen.avgRating != null && kitchen.avgRating > 0 && (
                            <div className="flex items-center gap-0.5 rounded bg-success px-1.5 py-0.5 shadow-sm">
                              <Star className="h-2.5 w-2.5 fill-white text-white" />
                              <span className="text-[10px] font-black text-white">{kitchen.avgRating.toFixed(1)}</span>
                            </div>
                          )}
                          <span className="flex items-center gap-0.5 text-[10px] font-black text-white/90 uppercase tracking-tighter">
                            <Clock className="h-2.5 w-2.5" />
                            30-40 min
                          </span>
                       </div>
                    </div>

                    <div className="absolute top-3 right-3 z-10">
                      <KitchenWishlistButton
                        kitchenPartnerId={kitchen.id}
                        size="sm"
                        className="bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-all scale-90 group-hover:scale-100"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-3 px-1 space-y-0.5">
                    <p className="text-sm font-black text-foreground truncate">{kitchen.displayName}</p>
                    {kitchen.cuisineTags.length > 0 && (
                      <p className="text-xs font-bold text-muted-foreground/60 truncate uppercase tracking-tighter">
                        {kitchen.cuisineTags.slice(0, 3).join(" • ")}
                      </p>
                    )}
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  )
}
