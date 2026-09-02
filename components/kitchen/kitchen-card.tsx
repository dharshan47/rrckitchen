"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Star,
  Clock,
  MapPin,
  ShieldCheck,
  ChefHat,
  BadgeCheck,
} from "lucide-react";
import type { KitchenData } from "@/hooks/useExploreKitchens";
import {
  getKitchenStatus,
  type KitchenStatus,
} from "@/components/kitchen/kitchen-timing-display";
import { useMenuDeliveryLat, useMenuDeliveryLng } from "@/stores";
import { haversineDistance, THANJAVUR_CENTER } from "@/lib/geo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Circle } from "lucide-react";

interface KitchenCardProps {
  kitchen: KitchenData;
  variant?: "home" | "page" | "search";
  onClick?: () => void;
  badges?: string[];
  rightBadges?: string[];
  query?: string;
}

export function KitchenCard({
  kitchen,
  onClick,
  query,
  badges = [],
  rightBadges = [],
  variant,
}: KitchenCardProps) {
  const [status, setStatus] = useState<KitchenStatus>(() =>
    getKitchenStatus(kitchen.operatingHours ?? null),
  );

  // Re-evaluate open/closed status every minute so the badge stays live.
  useEffect(() => {
    const computeStatus = () =>
      setStatus(getKitchenStatus(kitchen.operatingHours ?? null));
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
    <div className="bg-[#F44A01] text-white text-[10.5px] font-bold px-2.5 py-1 rounded-[6px] tracking-wide shadow-sm">
      {kitchen.customOfferText}
    </div>
  ) : isTopRated ? (
    <div className="bg-[#08733F] text-white text-[10.5px] font-bold px-2.5 py-1 rounded-[6px] tracking-wide shadow-sm">
      Top Rated
    </div>
  ) : isNew ? (
    <div className="bg-[#6D28D9] text-white text-[10.5px] font-bold px-2.5 py-1 rounded-[6px] tracking-wide shadow-sm">
      New
    </div>
  ) : (
    <div className="bg-[#F44A01] text-white text-[10.5px] font-bold px-2.5 py-1 rounded-[6px] tracking-wide shadow-sm">
      Bestseller
    </div>
  );

  const exactDietBadge = isPureVeg ? (
    <div className="flex items-center gap-1.5 bg-white border border-[#DCE8DC] px-2 py-1 rounded-[6px] shadow-sm">
      <BadgeCheck
        className="h-[14px] w-[14px] text-[#08733F]"
        strokeWidth={2}
      />
      <span className="text-[10.5px] font-bold text-[#155B38]">Pure Veg</span>
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
    <div className="flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.045)] border border-[#E7E7E7] overflow-visible transition-shadow hover:shadow-md bg-[#FFFFFF] w-full h-full relative group rounded-[16px]">
      <Link
        href={kitchenHref}
        onClick={onClick}
        className="flex flex-col flex-1"
      >
        {/* Image Section */}
        <div
          className={cn(
            "relative w-full h-[132px] sm:h-[140px] bg-muted shrink-0 rounded-t-[16px]",
          )}
        >
          <div className="absolute inset-0 overflow-hidden rounded-t-[16px]">
            {kitchen.coverImageUrl ? (
              <>
                <Image
                  src={kitchen.coverImageUrl}
                  alt={kitchen.displayName}
                  fill
                  className={cn(
                    "object-cover ",
                    isClosed && "grayscale opacity-90",
                  )}
                  sizes="(max-width: 768px) 100vw, 300px"
                />
                {variant !== "home" && variant !== "search" ? (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 75%, rgba(0,0,0,0.35) 100%)",
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02),rgba(0,0,0,0.02))] pointer-events-none" />
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full bg-[#fdfbf7]">
                <ChefHat className="h-10 w-10 text-gray-300" />
              </div>
            )}
          </div>

          {/* Top Left Badge */}
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-col items-start gap-1">
            <div className="flex flex-wrap gap-1">{exactRankBadge}</div>
            {variant !== "search" && badges.length > 0 && (
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
          {variant !== "home" && (
            <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1 items-end">
              {variant === "search" ? (
                kitchen.items && kitchen.items.length > 0 ? (
                  <div className="bg-white text-[#155B38] border border-[#DCE8DC] text-[10.5px] font-bold px-2.5 py-1 rounded-[6px] tracking-wide shadow-sm max-w-[140px] truncate">
                    {kitchen.items[0].name}
                  </div>
                ) : query ? (
                  <div className="bg-white text-[#155B38] border border-[#DCE8DC] text-[10.5px] font-bold px-2.5 py-1 rounded-[6px] tracking-wide shadow-sm max-w-[140px] truncate capitalize">
                    {query}
                  </div>
                ) : null
              ) : (
                <>
                  {exactDietBadge}
                  {rightBadges.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-end">
                      {rightBadges.map((badge) => (
                        <div
                          key={badge}
                          className="bg-white text-[#155B38] border border-[#DCE8DC] text-[10.5px] font-bold px-2 py-1 rounded-[6px] tracking-wide shadow-sm"
                        >
                          {badge}
                        </div>
                      ))}
                    </div>
                  )}
                  {query && (
                    <div className="bg-white text-[#155B38] border border-[#DCE8DC] text-[10.5px] font-bold px-2 py-1 rounded-[6px] capitalize tracking-wide shadow-sm">
                      {query}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Chef Avatar with Checkmark */}
          <div className="absolute -bottom-[22px] left-4 z-20">
            <div className="relative">
              <Avatar className="h-11 w-11 rounded-full border-[2px] border-[#FFFFFF] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.18)] overflow-hidden">
                <AvatarImage
                  src={kitchen.imageUrl ?? "/kitchen/profile.webp"}
                  alt={kitchen.displayName}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gray-100">
                  <ChefHat className="h-5 w-5 text-gray-300" />
                </AvatarFallback>
              </Avatar>
              {variant !== "home" && variant !== "search" && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px] z-20 shadow-sm flex items-center justify-center">
                  <BadgeCheck
                    className="h-[16px] w-[16px] text-white fill-[#08733F]"
                    strokeWidth={2}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        {variant === "home" ? (
          <div className="px-4 pb-4 pt-7 flex flex-col flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-[16px] text-[#111111] leading-tight truncate">
                {kitchen.displayName}
              </h3>
              <BadgeCheck
                className="h-[18px] w-[18px] text-white fill-[#08733F] shrink-0"
                strokeWidth={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-y-1.5 mt-2.5 text-[12.5px] text-[#555555] font-medium">
              <div className="flex items-center gap-1">
                {kitchen.avgRating != null && kitchen.avgRating > 0 ? (
                  <>
                    <span className="text-[#F44A01] font-bold">
                      {kitchen.avgRating.toFixed(1)}
                    </span>
                    <Star className="h-3.5 w-3.5 fill-[#F44A01] text-[#F44A01] -mt-[1px]" />
                    {kitchen.totalReviews > 0 && (
                      <span className="text-[#111111] ml-0.5">
                        ({kitchen.totalReviews})
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-[#777777]">New</span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {isPureVeg ? (
                  <>
                    <div className="h-1.5 w-1.5 rounded-full bg-[#08733F]" />
                    <span className="text-[#111111]">Pure Veg</span>
                  </>
                ) : hasNonVeg ? (
                  <>
                    <div className="h-1.5 w-1.5 rounded-full bg-[#D92D20]" />
                    <span className="text-[#111111]">Non Veg</span>
                  </>
                ) : hasVeg ? (
                  <>
                    <div className="h-1.5 w-1.5 rounded-full bg-[#08733F]" />
                    <span className="text-[#111111]">Veg</span>
                  </>
                ) : null}
              </div>

              <div className="flex items-center gap-1.5">
                {kitchen.estimatedPrepTime != null && (
                  <>
                    <Clock
                      className="h-[14px] w-[14px] text-[#555555]"
                      strokeWidth={2}
                    />
                    <span>{kitchen.estimatedPrepTime} mins</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {distanceKm != null && (
                  <>
                    <MapPin
                      className="h-[14px] w-[14px] text-[#555555]"
                      strokeWidth={2}
                    />
                    <span>
                      {distanceKm < 1
                        ? `${Math.round(distanceKm * 1000)} m`
                        : `${distanceKm.toFixed(1)} km`}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4">
              <Button
                asChild
                variant="outline"
                className="w-full h-[36px] py-0 rounded-[6px] border border-[#F44A01] bg-[#FFFFFF] text-[#F44A01] text-[13px] font-bold hover:bg-[#FFF1EB] hover:border-[#E94300] hover:text-[#E94300] shadow-none uppercase tracking-wide"
              >
                <span className="cursor-pointer">Order Now</span>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="px-4 pb-3 pt-8 flex flex-col flex-1">
              {/* Kitchen Name */}
              {/* Kitchen Name */}
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-[16px] text-[#111111] leading-tight truncate">
                  {kitchen.displayName}
                </h3>
                {variant === "search" && (
                  <BadgeCheck
                    className="h-[18px] w-[18px] text-white fill-[#08733F] shrink-0"
                    strokeWidth={2}
                  />
                )}
              </div>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-1 mt-1.5">
                {kitchen.avgRating != null && kitchen.avgRating > 0 ? (
                  <>
                    <span
                      className={cn(
                        "font-bold text-[13px]",
                        variant === "search"
                          ? "text-[#F44A01]"
                          : "text-[#111111]",
                      )}
                    >
                      {kitchen.avgRating.toFixed(1)}
                    </span>
                    <Star className="h-3.5 w-3.5 fill-[#F44A01] text-[#F44A01] -mt-[1px]" />
                    {kitchen.totalReviews > 0 && (
                      <span className="text-[#777777] font-medium text-[13px] ml-0.5">
                        ({kitchen.totalReviews})
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-[#777777] font-medium text-[13px]">
                    New
                  </span>
                )}
              </div>

              {/* Cuisines */}
              <p className="text-[13px] text-[#555555] mt-1.5 line-clamp-1 font-medium">
                {kitchen.cuisineTags && kitchen.cuisineTags.length > 0
                  ? kitchen.cuisineTags.slice(0, 2).join(" • ")
                  : "Kitchen"}
              </p>

              {/* Time & Distance */}
              <div
                className={cn(
                  "flex items-center text-[13px] text-[#555555] mt-1.5 font-medium",
                  variant === "search" ? "gap-4" : "",
                )}
              >
                {kitchen.estimatedPrepTime != null && (
                  <div className="flex items-center gap-1.5">
                    <Clock
                      className="h-[14px] w-[14px] text-[#555555]"
                      strokeWidth={2}
                    />
                    <span>
                      {kitchen.estimatedPrepTime}–
                      {kitchen.estimatedPrepTime + 5} mins
                    </span>
                  </div>
                )}
                {kitchen.estimatedPrepTime != null &&
                  distanceKm != null &&
                  variant !== "search" && (
                    <span className="text-[#F44A01] mx-2 text-[18px] leading-[0]">
                      •
                    </span>
                  )}
                {distanceKm != null && (
                  <div className="flex items-center gap-1.5">
                    <MapPin
                      className="h-[14px] w-[14px] text-[#555555]"
                      strokeWidth={2}
                    />
                    <span>
                      {distanceKm < 1
                        ? `${Math.round(distanceKm * 1000)} m`
                        : `${distanceKm.toFixed(1)} km`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Section */}
            <div className="px-2.5 sm:px-4 pb-2.5 sm:pb-4 mt-auto flex items-center justify-between gap-1 flex-nowrap">
              <div className="flex items-center gap-1 bg-[#F5F8F2] border border-[#DCE8DC] px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-[6px] shrink min-w-0">
                {variant === "search" ? (
                  <ShieldCheck
                    className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-[#176B43] shrink-0"
                    strokeWidth={2.5}
                  />
                ) : (
                  <Circle
                    className="h-2.5 sm:h-3 w-2.5 sm:w-3 text-[#176B43] shrink-0"
                    strokeWidth={2.5}
                  />
                )}
                <span className="text-[#176B43] text-[9px] sm:text-[11px] font-bold tracking-tight whitespace-nowrap">
                  100% Hygienic
                </span>
              </div>
              <Button
                asChild
                variant="outline"
                className="px-2 sm:px-4 py-1 sm:py-1.5 h-auto rounded-[6px] border border-[#F44A01] bg-[#FFFFFF] text-[#F44A01] text-[10px] sm:text-[12px] font-bold hover:bg-[#FFF1EB] hover:border-[#E94300] hover:text-[#E94300] shadow-none shrink-0"
              >
                <span className="cursor-pointer whitespace-nowrap">
                  View Menu
                </span>
              </Button>
            </div>
          </>
        )}
      </Link>
    </div>
  );
}
