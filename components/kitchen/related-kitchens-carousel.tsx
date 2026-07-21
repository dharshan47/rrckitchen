"use client"

import Link from "next/link"
import Image from "next/image"
import { Star, ChefHat } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"
import { KitchenWishlistButton } from "@/components/kitchen/kitchen-wishlist-button"
import type { RelatedKitchen } from "@/actions/catalog/home-data"

interface Props {
  kitchenName: string
  kitchens: RelatedKitchen[]
}

export function RelatedKitchensCarousel({ kitchenName, kitchens }: Props) {
  if (!kitchens.length) return null

  return (
    <section className="py-6 sm:py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-extrabold text-foreground">
          Related to {kitchenName}
        </h2>
        <div className="hidden sm:flex items-center gap-1">
          <CarouselPrevious className="static translate-y-0 h-8 w-8" />
          <CarouselNext className="static translate-y-0 h-8 w-8" />
        </div>
      </div>
      <Carousel opts={{ align: "start", dragFree: true }}>
        <CarouselContent>
          {kitchens.map((kitchen) => (
            <CarouselItem key={kitchen.id} className="basis-1/2 sm:basis-1/3 lg:basis-1/4 pl-3">
              <Link href={`/kitchen/${kitchen.slug}`} className="block hover:scale-[0.97] transition-transform duration-300">
                <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-muted">
                  {kitchen.imageUrl ? (
                    <Image
                      src={kitchen.imageUrl}
                      alt={kitchen.displayName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/10 to-muted">
                      <ChefHat className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 z-10">
                    <KitchenWishlistButton kitchenPartnerId={kitchen.id} size="sm" />
                  </div>
                </div>
                <div className="mt-2 space-y-1">
                  <h3 className="text-sm font-bold text-foreground truncate leading-tight">
                    {kitchen.displayName}
                  </h3>
                  {kitchen.avgRating != null && kitchen.avgRating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-green-600 text-green-600" />
                      <span className="text-xs font-semibold text-green-600">
                        {kitchen.avgRating.toFixed(1)}
                      </span>
                    </div>
                  )}
                  {kitchen.cuisineTags.length > 0 && (
                    <p className="text-[11px] text-muted-foreground truncate leading-tight">
                      {kitchen.cuisineTags.join(" • ")}
                    </p>
                  )}
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  )
}
