"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Star, Clock, MapPin, CheckCircle2, ShieldCheck, ChefHat } from "lucide-react";
import type { KitchenData } from "@/hooks/useExploreKitchens";
import { getKitchenStatus, type KitchenStatus } from "@/components/kitchen/kitchen-timing-display";
import { useMenuDeliveryLat, useMenuDeliveryLng } from "@/stores";
import { haversineDistance } from "@/lib/geo";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface KitchenCardProps {
  kitchen: KitchenData;
  variant?: "home" | "page";
  onClick?: () => void;
}

export function KitchenCard({ kitchen, variant = "home", onClick }: KitchenCardProps) {
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

  const distanceKm = useMemo(() => {
    if (deliveryLat == null || deliveryLng == null || kitchen.lat == null || kitchen.lng == null) return null;
    return haversineDistance(deliveryLat, deliveryLng, kitchen.lat, kitchen.lng);
  }, [deliveryLat, deliveryLng, kitchen.lat, kitchen.lng]);

  // Badges derived from real backend data.
  const isTopRated = kitchen.avgRating != null && kitchen.avgRating >= 4.5;
  const isNew = kitchen.avgRating == null || kitchen.avgRating === 0;

  // Pure veg derived from the kitchen's actual menu items.
  const isPureVeg =
    kitchen.items.length > 0 && kitchen.items.every((i) => i.foodType === "VEG");

  const kitchenHref = `/kitchens/${kitchen.slug}`;

  const statusBadge = (
    <Badge
      className={cn(
        "gap-1 px-2 py-0.5 rounded-full border border-gray-100 text-[10px] font-black uppercase tracking-wide",
        status.isOpen
          ? "bg-white/95 text-green-700"
          : "bg-white/95 text-red-600"
      )}
    >
      <div className={cn("h-1.5 w-1.5 rounded-full", status.isOpen ? "bg-green-500" : "bg-red-500")} />
      {status.isOpen ? "Open" : "Closed"}
    </Badge>
  );

  const rankBadge = kitchen.customOfferText ? (
    <Badge className="bg-[#EE7005] hover:bg-[#EE7005] text-white text-[11px] font-black px-2.5 py-1 rounded-sm uppercase tracking-wider">
      {kitchen.customOfferText}
    </Badge>
  ) : isTopRated ? (
    <Badge className="bg-[#168846] hover:bg-[#168846] text-white text-[11px] font-black px-2.5 py-1 rounded-sm uppercase tracking-wider">
      Top Rated
    </Badge>
  ) : isNew ? (
    <Badge className="bg-[#8b5cf6] hover:bg-[#8b5cf6] text-white text-[11px] font-black px-2.5 py-1 rounded-sm uppercase tracking-wider">
      New
    </Badge>
  ) : null;

  const chefAvatar = (
    <Avatar className="h-full w-full rounded-full">
      {kitchen.imageUrl ? (
        <AvatarImage src={kitchen.imageUrl} alt={kitchen.displayName} className="object-cover" />
      ) : null}
      <AvatarFallback className="bg-gray-100 rounded-full">
        <ChefHat className="h-5 w-5 text-gray-300" />
      </AvatarFallback>
    </Avatar>
  );

  if (variant === "home") {
    return (
      <Card className="flex flex-col overflow-hidden rounded-[20px] border-border shadow-sm transition-shadow hover:shadow-md w-full h-full">
        <Link
          href={kitchenHref}
          onClick={onClick}
          className="flex flex-col flex-1"
        >
          <div className="relative h-[180px] w-full bg-muted/50 shrink-0">
            {kitchen.imageUrl ? (
              <Image
                src={kitchen.imageUrl}
                alt={kitchen.displayName}
                fill
                className={cn("object-cover transition-transform duration-500 group-hover:scale-105", isClosed && "grayscale")}
                sizes="300px"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-[#fdfbf7]">
                <ChefHat className="h-8 w-8 text-gray-300" />
              </div>
            )}

            {/* Top Left Badge */}
            <div className="absolute top-3 left-3 z-10">{rankBadge}</div>

            {/* Live status chip */}
            <div className="absolute top-3 right-3 z-10">{statusBadge}</div>

            {/* Chef Portrait */}
            <div className="absolute -bottom-5 left-4 z-10">
              <div className="h-11 w-11 rounded-full border-[3px] border-white bg-white shadow-sm overflow-hidden">
                {chefAvatar}
              </div>
            </div>
          </div>

          <CardContent className="p-4 pt-7 flex flex-col flex-1">
            <div className="flex items-center gap-1 mb-1">
              <h3 className="font-bold text-[17px] text-[#0A3D24] leading-tight truncate">{kitchen.displayName}</h3>
              <CheckCircle2 className="h-4 w-4 text-[#168846] fill-[#168846] text-white shrink-0" />
            </div>

            <div className="flex items-center gap-2 mt-1 text-[13px] font-bold text-gray-700">
              <div className="flex items-center gap-0.5">
                {kitchen.avgRating != null && kitchen.avgRating > 0 ? (
                  <>
                    <span className="text-primary">{kitchen.avgRating.toFixed(1)}</span>
                    <Star className="h-3.5 w-3.5 fill-primary text-primary -mt-0.5" />
                    {kitchen.totalReviews > 0 && (
                      <span className="text-muted-foreground font-medium ml-0.5">({kitchen.totalReviews})</span>
                    )}
                  </>
                ) : (
                  <span className="text-muted-foreground font-medium">New</span>
                )}
              </div>
              {isPureVeg && (
                <>
                  <span className="text-gray-300 font-medium">•</span>
                  <span className="text-gray-600 font-medium">Pure Veg</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-4 text-[12px] font-bold text-gray-600 mt-3">
              {kitchen.estimatedPrepTime != null && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-muted-foreground" /> {kitchen.estimatedPrepTime} mins
                </div>
              )}
              {distanceKm != null && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-muted-foreground" /> {distanceKm.toFixed(1)} km
                </div>
              )}
            </div>
          </CardContent>
        </Link>

        {/* Order Now */}
        <div className="px-4 pb-4">
          <Button asChild variant="outline" className="w-full h-auto py-2.5 rounded-md border-[1.5px] border-primary text-primary text-[13px] font-black uppercase tracking-wider hover:bg-primary/5">
            <Link href={kitchenHref}>Order Now</Link>
          </Button>
        </div>
      </Card>
    );
  }

  // variant === "page"
  return (
    <Card className="flex flex-col md:rounded-2xl md:shadow-sm border-b md:border border-gray-100 md:border-border md:overflow-hidden transition-all relative py-4 md:p-0 gap-3 md:gap-0 shadow-none hover:shadow-md hover:border-gray-300 rounded-none md:rounded-2xl">
      <Link
        href={kitchenHref}
        onClick={onClick}
        className="flex flex-row md:flex-col flex-1 gap-3 md:gap-0 min-w-0"
      >
        {/* Image Container */}
        <div className="relative w-[115px] md:w-full h-[130px] md:h-[180px] shrink-0 bg-muted/50 overflow-hidden rounded-xl md:rounded-none">
          {kitchen.imageUrl ? (
            <Image
              src={kitchen.imageUrl}
              alt={kitchen.displayName}
              fill
              className={cn("object-cover transition-transform duration-500 group-hover:scale-105", isClosed && "grayscale")}
              sizes="(max-width: 768px) 100vw, 400px"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-[#fdfbf7]">
              <ChefHat className="h-8 w-8 text-gray-300" />
            </div>
          )}

          {/* Top Left Badge */}
          <div className="absolute top-2 md:top-3 left-2 md:left-3 z-10">
            {kitchen.customOfferText ? (
              <Badge className="bg-[#EE7005] hover:bg-[#EE7005] text-white text-[9px] md:text-[11px] font-black px-1.5 py-0.5 md:py-1 md:px-2 rounded-sm uppercase tracking-wide">
                {kitchen.customOfferText}
              </Badge>
            ) : isTopRated ? (
              <Badge className="bg-[#168846] hover:bg-[#168846] text-white text-[9px] md:text-[11px] font-black px-1.5 py-0.5 md:py-1 md:px-2 rounded-sm uppercase tracking-wide">
                Top Rated
              </Badge>
            ) : isNew ? (
              <Badge className="bg-[#8b5cf6] hover:bg-[#8b5cf6] text-white text-[9px] md:text-[11px] font-black px-1.5 py-0.5 md:py-1 md:px-2 rounded-sm uppercase tracking-wide">
                New
              </Badge>
            ) : null}
          </div>

          {/* Pure Veg Badge */}
          {isPureVeg && (
            <div className="absolute bottom-2 right-2 z-10">
              <Badge className="gap-1 bg-white/95 hover:bg-white/95 border border-gray-100 px-1.5 py-0.5 md:px-2 md:py-1 rounded-sm shadow-sm text-[9px] md:text-[10px] font-black text-[#168846]">
                <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-sm border border-[#168846] flex items-center justify-center p-[1px]">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#168846]" />
                </div>
                Pure Veg
              </Badge>
            </div>
          )}

          {/* Live status chip */}
          <div className="absolute top-2 md:top-3 right-2 md:right-3 z-20">{statusBadge}</div>

          {/* Chef Portrait */}
          <div className="absolute bottom-2 md:-bottom-5 left-2 md:left-4 z-10">
            <div className="h-8 w-8 md:h-11 md:w-11 rounded-full border-2 border-white bg-white shadow-sm overflow-hidden">
              {chefAvatar}
            </div>
          </div>
        </div>

        {/* Content Container */}
        <CardContent className="flex-1 p-0 md:p-4 pt-1 md:pt-7 flex flex-col justify-between min-w-0">
          <div>
            {/* Title & Hygienic Badge */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-[15px] md:text-[18px] text-[#0A3D24] leading-tight flex items-center gap-1 line-clamp-1">
                {kitchen.displayName}
                <CheckCircle2 className="h-4 w-4 text-[#168846] fill-[#168846] text-white shrink-0" />
              </h3>

              {/* Hygienic badge on right for mobile */}
              <Badge className="md:hidden gap-0.5 bg-[#e8f5ed] hover:bg-[#e8f5ed] text-[#168846] px-1.5 py-0.5 rounded-sm text-[9px] font-black items-center shrink-0 whitespace-nowrap">
                <ShieldCheck className="h-3 w-3" /> 100% Hygienic
              </Badge>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mt-1 text-[12px] md:text-[13px] font-bold">
              {kitchen.avgRating != null && kitchen.avgRating > 0 ? (
                <>
                  <span className="text-gray-900">{kitchen.avgRating.toFixed(1)}</span>
                  <Star className="h-3 md:h-3.5 w-3 md:w-3.5 fill-[#F59E0B] text-[#F59E0B] -mt-0.5" />
                  {kitchen.totalReviews > 0 && (
                    <span className="text-gray-500 font-medium ml-0.5">({kitchen.totalReviews})</span>
                  )}
                </>
              ) : (
                <span className="text-gray-500 font-medium">New</span>
              )}
            </div>

            {/* Tags */}
            {kitchen.cuisineTags.length > 0 && (
              <p className="text-[12px] md:text-[13px] font-medium text-gray-600 mt-1.5 md:mt-2 line-clamp-1">
                {kitchen.cuisineTags.join(" • ")}
              </p>
            )}

            {/* Time & Distance */}
            <div className="flex items-center gap-3 text-[11px] md:text-[12px] font-bold text-gray-600 mt-1.5 md:mt-2">
              {kitchen.estimatedPrepTime != null && (
                <div className="flex items-center gap-1 md:gap-1.5">
                  <Clock className="h-3 md:h-3.5 w-3 md:w-3.5 text-gray-400" /> {kitchen.estimatedPrepTime} mins
                </div>
              )}
              {distanceKm != null && (
                <div className="flex items-center gap-1 md:gap-1.5 text-gray-400">•</div>
              )}
              {distanceKm != null && (
                <div className="flex items-center gap-1 md:gap-1.5">
                  <span className="text-[#EE7005] font-black text-[14px] leading-none mb-1">.</span>{" "}
                  {distanceKm.toFixed(1)} km
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Link>

      {/* Footer Row */}
      <div className="mt-2 md:mt-0 pt-2 md:pt-4 md:border-t border-gray-100 flex items-center justify-between md:px-4 md:pb-4">
        {/* Hygienic badge on left for desktop */}
        <Badge className="hidden md:flex gap-1 bg-transparent hover:bg-transparent text-[#168846] px-1 py-1 rounded-md text-[12px] font-black items-center">
          <ShieldCheck className="h-4 w-4" /> 100% Hygienic
        </Badge>

        {/* View Menu */}
        <Button
          asChild
          variant="outline"
          className="px-4 py-1.5 md:px-5 md:py-1.5 h-auto rounded-md border-[#EE7005] text-[#EE7005] text-[11px] md:text-[13px] font-bold hover:bg-[#EE7005]/5 hover:text-[#EE7005]"
        >
          <Link href={kitchenHref}>View Menu</Link>
        </Button>
      </div>
    </Card>
  );
}
