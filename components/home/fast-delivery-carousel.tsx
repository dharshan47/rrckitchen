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

// Extending the interface for UI purposes to match the design requirements
interface NearbyKitchenUI extends NearbyKitchen {
  time?: string
  offer?: string
  locality?: string
  isAd?: boolean
}

export function FastDeliveryCarousel() {
  const { data: session } = useSession()
  const deliveryAddress = useMenuDeliveryAddress()
  const isLoggedIn = !!session?.user
  const hasLocation = !!deliveryAddress
  const [kitchens, setKitchens] = useState<NearbyKitchenUI[]>([])

  const fetchNearbyKitchens = useCallback(async () => {
    if (!("geolocation" in navigator)) return

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        fetch(`/api/kitchen/nearby?lat=${latitude}&lng=${longitude}`)
          .then((res) => res.json())
          .then((data) => {
            // Mapping placeholder data for fields not yet in API but required for the "exact" design
            const mapped = (Array.isArray(data) ? data : []).map((k: NearbyKitchen, idx: number) => ({
              ...k,
              time: idx % 2 === 0 ? "10-15 mins" : "25-30 mins",
              offer: idx === 0 ? "50% OFF" : idx === 2 ? "ITEMS AT ₹89" : idx === 3 ? "₹200 OFF ABOVE" : undefined,
              locality: idx % 3 === 0 ? "Thiruvidaimaruthur main road" : idx % 3 === 1 ? "Ayekulam Road" : "Kumbakonam Locality",
              isAd: idx === 2 || idx === 4,
            }))
            setKitchens(mapped)
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
    <section className="w-full">
      <div className="flex items-center justify-between mb-4 sm:mb-6 px-1">
        <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
          Fast Delivery
        </h2>
        <div className="hidden lg:flex items-center gap-3">
          <CarouselPrevious className="static translate-y-0 h-9 w-9 rounded-full bg-gray-100 border-none text-foreground hover:bg-gray-200 transition-colors shadow-none flex items-center justify-center" />
          <CarouselNext className="static translate-y-0 h-9 w-9 rounded-full bg-gray-100 border-none text-foreground hover:bg-gray-200 transition-colors shadow-none flex items-center justify-center" />
        </div>
      </div>
      
      <div className="relative px-1">
        <Carousel opts={{ align: "start", dragFree: true }}>
          <CarouselContent className="-ml-4 sm:-ml-6">
            {kitchens.map((kitchen) => (
              <CarouselItem key={kitchen.id} className="pl-4 sm:pl-6 basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                <Link href={`/kitchen/${kitchen.slug}`} className="block group hover:scale-[0.97] active:scale-95 transition-all duration-300">
                  <div className="relative aspect-16/11 rounded-2xl overflow-hidden bg-muted shadow-sm">
                    {kitchen.imageUrl ? (
                      <Image
                        src={kitchen.imageUrl}
                        alt={kitchen.displayName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/10 to-muted">
                        <span className="text-muted-foreground/30 text-3xl font-black">{kitchen.displayName.charAt(0)}</span>
                      </div>
                    )}
                    
                    <div className="absolute top-2 right-2 z-20">
                      <KitchenWishlistButton kitchenPartnerId={kitchen.id} size="md" />
                    </div>

                    {/* Gradient overlay for bottom badges */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent opacity-90" />
                    
                    {/* Offer Badge at the bottom */}
                    {kitchen.offer && (
                      <div className="absolute bottom-2 left-3 right-3 z-10 px-0.5">
                        <span className="text-white text-lg sm:text-[22px] font-black tracking-tighter drop-shadow-md leading-none">
                          {kitchen.offer}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3.5 space-y-0.5 pl-1">
                    <h3 className="font-bold text-[18px] text-foreground truncate transition-colors leading-tight">
                      {kitchen.displayName}
                    </h3>
                    
                    <div className="flex items-center gap-1.5 text-[15px] font-bold text-foreground mt-1">
                      <div className="flex items-center justify-center h-4.5 w-4.5 rounded-full bg-success text-white">
                        <Star className="h-3 w-3 fill-white" />
                      </div>
                      <span>{kitchen.avgRating?.toFixed(1) ?? "4.3"}</span>
                      <span className="opacity-50">•</span>
                      <span>{kitchen.time ?? "10-15 mins"}</span>
                    </div>

                    <p className="text-[15px] font-medium text-gray-500 truncate leading-snug mt-1">
                      {kitchen.cuisineTags.length > 0 ? kitchen.cuisineTags.join(", ") : "Burgers, Fast Food, Rolls & Wraps"}
                    </p>
                    <p className="text-[15px] font-medium text-gray-500 truncate leading-snug">
                      {kitchen.locality ?? "Thiruvidaimaruthur main road"}
                    </p>
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

