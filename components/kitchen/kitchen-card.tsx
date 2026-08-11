"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Star, Clock, MapPin, ShieldCheck, ChefHat, BadgeCheck } from "lucide-react";
import type { KitchenData } from "@/hooks/useExploreKitchens";
import { getKitchenStatus, type KitchenStatus } from "@/components/kitchen/kitchen-timing-display";
import { useMenuDeliveryLat, useMenuDeliveryLng } from "@/stores";
import { haversineDistance, THANJAVUR_CENTER } from "@/lib/geo";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface KitchenCardProps {
  kitchen: KitchenData;
  variant?: "home" | "page" | "search";
  onClick?: () => void;
  badges?: string[];
  rightBadges?: string[];
  query?: string;
}

export function KitchenCard({ kitchen, onClick, query, badges = [], rightBadges = [], variant }: KitchenCardProps) {
  const [status, setStatus] = useState<KitchenStatus>(() =>
    getKitchenStatus(kitchen.operatingHours ?? null)
  );

  // Re-evaluate open/closed status every minute so the badge stays live.
  useEffect(() => {
    const computeStatus = () => setStatus(getKitchenStatus(kitchen.operatingHours ?? null));
    computeStatus();
    const timer = window.setInterval(computeStatus, 60_000);
    return () => window.clearInterval(timer);
  }, [kitchen.operatingHours]);

  const isClosed = !status.isOpen;
  const deliveryLat = useMenuDeliveryLat();
  const deliveryLng = useMenuDeliveryLng();

  // Distance from the customer's delivery location to the kitchen.
  // Falls back to the Thanjavur city center when the customer has not
  // chosen a delivery location yet.
  const distanceKm = useMemo(() => {
    if (kitchen.lat == null || kitchen.lng == null) return null;
    const fromLat = deliveryLat ?? THANJAVUR_CENTER[0];
    const fromLng = deliveryLng ?? THANJAVUR_CENTER[1];
    return haversineDistance(fromLat, fromLng, kitchen.lat, kitchen.lng);
  }, [deliveryLat, deliveryLng, kitchen.lat, kitchen.lng]);

  // Badges derived from real backend data.
  const isTopRated = kitchen.avgRating != null && kitchen.avgRating >= 4.5;
  const isNew = kitchen.avgRating == null || kitchen.avgRating === 0;

  // Pure veg derived from the kitchen's actual menu items.
  const hasVeg = kitchen.items?.some((i) => i.foodType === "VEG");
  const hasNonVeg = kitchen.items?.some((i) => i.foodType === "NONVEG");
  const isPureVeg = hasVeg && !hasNonVeg && (kitchen.items?.length ?? 0) > 0;
  
  const exactRankBadge = kitchen.customOfferText ? (
    <div className="bg-[#F44A01] text-white text-[9.5px] font-bold px-2 py-0.5 rounded-[5px] tracking-wide shadow-sm">
      {kitchen.customOfferText}
    </div>
  ) : isTopRated ? (
    <div className="bg-[#08733F] text-white text-[9.5px] font-bold px-2 py-0.5 rounded-[5px] tracking-wide shadow-sm">
      Top Rated
    </div>
  ) : isNew ? (
    <div className="bg-[#6D28D9] text-white text-[9.5px] font-bold px-2 py-0.5 rounded-[5px] tracking-wide shadow-sm">
      New
    </div>
  ) : (
    <div className="bg-[#F44A01] text-white text-[9.5px] font-bold px-2 py-0.5 rounded-[5px] tracking-wide shadow-sm">
      Bestseller
    </div>
  );

  const exactDietBadge = isPureVeg ? (
    <div className="flex items-center gap-1 bg-[#F5F8F2] border border-[#DCE8DC] px-1.5 py-0.5 rounded-[5px] shadow-sm">
      <div className="flex items-center justify-center">
        <div className="h-2.5 w-2.5 border-[1.2px] border-[#08733F] rounded-[2px] flex items-center justify-center">
          <div className="h-1.5 w-1.5 bg-[#08733F] rounded-full" />
        </div>
      </div>
      <span className="text-[9.5px] font-bold text-[#155B38]">Pure Veg</span>
    </div>
  ) : hasNonVeg ? (
    <div className="flex items-center gap-1 bg-[#FFF5F3] border border-[#EBD8D4] px-1.5 py-0.5 rounded-[5px] shadow-sm">
      <div className="flex items-center justify-center">
        <div className="h-2.5 w-2.5 border-[1.2px] border-[#D92D20] rounded-[2px] flex items-center justify-center">
          <div className="h-1.5 w-1.5 bg-[#D92D20] rounded-full" />
        </div>
      </div>
      <span className="text-[9.5px] font-bold text-[#8F2118]">Non Veg</span>
    </div>
  ) : hasVeg ? (
    <div className="flex items-center gap-1 bg-[#F5F8F2] border border-[#DCE8DC] px-1.5 py-0.5 rounded-[5px] shadow-sm">
      <div className="flex items-center justify-center">
        <div className="h-2.5 w-2.5 border-[1.2px] border-[#08733F] rounded-[2px] flex items-center justify-center">
          <div className="h-1.5 w-1.5 bg-[#08733F] rounded-full" />
        </div>
      </div>
      <span className="text-[9.5px] font-bold text-[#155B38]">Veg</span>
    </div>
  ) : null;

  const kitchenHref = `/kitchens/${kitchen.slug}`;

  return (
    <Card className="flex flex-col rounded-[9px] shadow-[0_2px_8px_rgba(0,0,0,0.045)] border border-[#E7E7E7] overflow-visible transition-shadow hover:shadow-md bg-[#FFFFFF] w-full h-full relative group">
      <Link href={kitchenHref} onClick={onClick} className="flex flex-col flex-1">
        {/* Image Section */}
        <div className="relative w-full h-[132px] sm:h-[140px] bg-muted rounded-t-[9px] shrink-0 overflow-hidden">
          {kitchen.imageUrl ? (
            <>
              <Image
                src={kitchen.imageUrl}
                alt={kitchen.displayName}
                fill
                className={cn("object-cover group-hover:scale-105 transition-transform duration-500", isClosed && "grayscale opacity-90")}
                sizes="(max-width: 768px) 100vw, 300px"
              />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02),rgba(0,0,0,0.02))] pointer-events-none" />
            </>
          ) : (
            <div className="flex items-center justify-center h-full bg-[#fdfbf7]">
              <ChefHat className="h-10 w-10 text-gray-300" />
            </div>
          )}

          {/* Top Left Badge */}
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-col items-start gap-1">
            <div className="flex flex-wrap gap-1">{exactRankBadge}</div>
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {badges.map((badge) => (
                  <div
                    key={badge}
                    className="bg-[#00512F] text-white text-[9.5px] font-bold px-2 py-0.5 rounded-[5px] tracking-wide shadow-sm"
                  >
                    {badge}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Right Diet Badge and Query */}
          <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1 items-end">
             {exactDietBadge}
             {variant === "search" && rightBadges.length > 0 && (
               <div className="flex flex-wrap gap-1 justify-end">
                 {rightBadges.map((badge) => (
                   <div
                     key={badge}
                     className="bg-[#00512F] text-white text-[9.5px] font-bold px-2 py-0.5 rounded-[5px] tracking-wide shadow-sm"
                   >
                     {badge}
                   </div>
                 ))}
               </div>
             )}
             {query && (
               <div className="bg-[#F5F8F2] text-[#155B38] border border-[#DCE8DC] text-[9.5px] font-bold px-1.5 py-0.5 rounded-[5px] capitalize tracking-wide shadow-sm">
                 {query}
               </div>
             )}
          </div>

          {/* Chef Avatar with Checkmark */}
          <div className="absolute -bottom-[22px] left-3 z-20">
            <div className="relative">
              <Avatar className="h-11 w-11 rounded-full border-[2px] border-[#FFFFFF] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.18)] overflow-hidden">
                <AvatarImage src={kitchen.profileImage ?? "/kitchen/profile.webp"} alt={kitchen.displayName} className="object-cover" />
                <AvatarFallback className="bg-gray-100">
                  <ChefHat className="h-5 w-5 text-gray-300" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 -right-1 h-3.5 w-3.5 bg-[#FFFFFF] rounded-full flex items-center justify-center z-20">
                <BadgeCheck className="h-3.5 w-3.5 text-[#08733F] fill-[#FFFFFF]" strokeWidth={1.8} />
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="px-3.5 pb-3.5 pt-7 flex flex-col flex-1">
          {/* Kitchen Name */}
          <h3 className="font-bold text-[14px] text-[#111111] leading-tight truncate">{kitchen.displayName}</h3>
          
          {/* Rating & Reviews */}
          <div className="flex items-center gap-1 text-[11px] mt-1.5">
            {kitchen.avgRating != null && kitchen.avgRating > 0 ? (
              <>
                <span className="text-[#111111] font-bold">{kitchen.avgRating.toFixed(1)}</span>
                <Star className="h-3 w-3 fill-[#F44A01] text-[#F44A01] -mt-0.5" />
                {kitchen.totalReviews > 0 && (
                  <span className="text-[#777777] font-normal ml-0.5">({kitchen.totalReviews})</span>
                )}
              </>
            ) : (
              <span className="text-[#777777] font-medium">New</span>
            )}
          </div>

          {/* Cuisines */}
          <p className="text-[11px] text-[#555555] mt-1.5 line-clamp-1">
            {kitchen.cuisineTags && kitchen.cuisineTags.length > 0 
              ? kitchen.cuisineTags.slice(0, 2).join(" · ") 
              : "Kitchen"}
            {kitchen.locality && ` · ${kitchen.locality}`}
          </p>

          {/* Time & Distance */}
          <div className="flex items-center text-[11px] text-[#555555] mt-1.5">
            {kitchen.estimatedPrepTime != null && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-[13px] w-[13px] text-[#222222]" strokeWidth={1.8} /> {kitchen.estimatedPrepTime} mins
              </div>
            )}
            {kitchen.estimatedPrepTime != null && distanceKm != null && (
              <span className="text-[#F44A01] mx-2 text-[14px] leading-none mb-1">•</span>
            )}
            {distanceKm != null && (
              <div className="flex items-center gap-1">
                <MapPin className="h-[13px] w-[13px] text-[#F44A01]" strokeWidth={1.8} />
                {distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`} away
              </div>
            )}
          </div>
        </CardContent>

        {/* Footer Section */}
        <div className="px-3.5 pb-3.5 mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-[#EEF8F1] border border-[#D7EBDD] px-2 py-1 rounded-[5px]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#176B43]" strokeWidth={1.8} />
            <span className="text-[#176B43] text-[9.5px] font-bold tracking-wide">100% Hygienic</span>
          </div>
          <Button
            asChild
            variant="outline"
            className="px-3 py-1 h-[26px] rounded-[5px] border border-[#F44A01] bg-[#FFFFFF] text-[#F44A01] text-[10px] font-bold hover:bg-[#FFF1EB] hover:border-[#E94300] hover:text-[#E94300] shadow-none"
          >
            <span className="cursor-pointer">View Menu</span>
          </Button>
        </div>
      </Link>
    </Card>
  );
}
