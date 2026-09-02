"use client"

import Link from "next/link"
import type { RelatedKitchen } from "@/actions/catalog/home-data"
import { KitchenCard } from "@/components/kitchen/kitchen-card"
import type { KitchenData } from "@/hooks/useExploreKitchens"

interface Props {
  kitchenName?: string
  kitchens: RelatedKitchen[]
  title?: string
}

export function RelatedKitchensGrid({ kitchenName, kitchens, title }: Props) {
  if (!kitchens.length) return null

  const displayKitchens = kitchens.slice(0, 8)
  const displayTitle = title || (kitchenName ? `Related to ${kitchenName}` : "You might also like")

  return (
    <section className="w-full mt-8">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-xl font-bold text-foreground">
          {displayTitle}
        </h2>
        <Link href="/kitchens" className="text-sm font-semibold text-[#ff4500] hover:underline">
          View All
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6 px-1">
        {displayKitchens.map((kitchen) => {
          // Map to KitchenData
          const kitchenData: KitchenData = {
            id: kitchen.id,
            slug: kitchen.slug,
            displayName: kitchen.displayName,
            avgRating: kitchen.avgRating,
            totalReviews: kitchen.totalReviews,
            imageUrl: kitchen.imageUrl,
            coverImageUrl: kitchen.coverImageUrl,
            customOfferText: null,
            cuisineTags: kitchen.cuisineTags,
            items: [],
            timeSlots: kitchen.timeSlots,
            lat: null,
            lng: null,
            estimatedPrepTime: kitchen.estimatedPrepTime,
            operatingHours: null,
          };

          return (
            <KitchenCard 
              key={kitchen.id}
              kitchen={kitchenData}
              variant="page"
            />
          )
        })}
      </div>
    </section>
  )
}
