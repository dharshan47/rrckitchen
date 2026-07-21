"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Star } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"
import { KitchenWishlistButton } from "@/components/kitchen/kitchen-wishlist-button"
import { useSession } from "@/lib/auth-client"
import { useMenuDeliveryAddress } from "@/stores"
import type { NearbyKitchen } from "@/actions/catalog/nearby-kitchens"

export function FastDeliveryCarousel() {
  const { data: session } = useSession()
  const deliveryAddress = useMenuDeliveryAddress()
  const isLoggedIn = !!session?.user
  const hasLocation = !!deliveryAddress
  const [kitchens, setKitchens] = useState<NearbyKitchen[]>([])

  const fetchNearbyKitchens = useCallback(async () => {
    if (!("geolocation" in navigator)) return

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        fetch(`/api/kitchen/nearby?lat=${latitude}&lng=${longitude}`)
          .then((res) => res.json())
          .then((data) => {
            setKitchens(Array.isArray(data) ? data : [])
          })
          .catch(() => {})
      },
      () => {},
      { timeout: 5000, enableHighAccuracy: false },
    )
  }, [])

  useEffect(() => {
    if (isLoggedIn && hasLocation) {
      fetchNearbyKitchens()
    }
  }, [isLoggedIn, hasLocation, fetchNearbyKitchens])

  if (!isLoggedIn || !hasLocation || kitchens.length === 0) return null

  return (
    <section className="hidden lg:block">
      <div className="flex items-center justify-between mb-3 lg:mb-5">
        <h2 className="text-base lg:text-lg font-extrabold text-foreground">Fast Delivery</h2>
        <div className="hidden lg:flex items-center gap-1">
          <CarouselPrevious className="static translate-y-0 h-8 w-8" />
          <CarouselNext className="static translate-y-0 h-8 w-8" />
        </div>
      </div>
      <Carousel opts={{ align: "start", dragFree: true }}>
        <CarouselContent>
          {kitchens.map((kitchen) => (
            <CarouselItem key={kitchen.id} className="basis-1/2 md:basis-1/3 xl:basis-1/4 pl-3">
              <Link href={`/kitchen/${kitchen.slug}`} className="block hover:scale-[0.97] transition-transform duration-300">
                <div className="relative aspect-4/3 rounded-xl overflow-hidden">
                  {kitchen.imageUrl ? (
                    <Image
                      src={kitchen.imageUrl}
                      alt={kitchen.displayName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/10 to-muted">
                      <span className="text-muted-foreground/40 text-sm font-medium">{kitchen.displayName.charAt(0)}</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 z-10">
                    <KitchenWishlistButton kitchenPartnerId={kitchen.id} />
                  </div>
                </div>
                <div className="mt-2 space-y-0.5">
                  <p className="text-sm font-bold text-foreground truncate">{kitchen.displayName}</p>
                  {kitchen.avgRating != null && kitchen.avgRating > 0 && (
                    <p className="text-xs font-semibold text-green-600 flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-green-600 text-green-600" />
                      {kitchen.avgRating.toFixed(1)}
                    </p>
                  )}
                  {kitchen.cuisineTags.length > 0 && (
                    <p className="text-[11px] text-muted-foreground truncate">
                      {kitchen.cuisineTags.slice(0, 3).join(" • ")}
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
