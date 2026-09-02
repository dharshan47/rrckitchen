"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressiveImage } from "@/components/patterns/progressive-image";
import { useCartActions, useCartItems, useMenuDeliveryAddress } from "@/stores";
import { LocationDialog } from "@/components/location";
import { getMenuItemByIdentifierClient } from "@/actions/catalog/menu-client-actions";
import { getMenuItemReviews } from "@/actions/catalog/menu-reviews";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ChevronLeft, ChevronRight, Star, MapPin,
  Share2, Minus, Plus, Heart, Leaf, Flame, Utensils,
  ShieldCheck, Truck, Timer, Clock,
  Package, ShoppingCart, Users, Scale, AlertTriangle,
  User, Phone, BadgeCheck, Bike, ClipboardList, Sparkles, Dna, Gift, ChefHat
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { WishlistButton } from "@/components/menu/wishlist-button";
import { AddToCartPopup, type AddPopupItem } from "@/components/menu/add-to-cart-popup";

interface MenuItemPhoto {
  id?: string;
  imageUrl: string;
  sortOrder: number;
}

interface MenuItemHighlight {
  title: string;
  description: string;
  enabled: boolean;
}

interface RelatedMenuItem {
  id: string;
  name: string;
  price: number;
  avgRating: number | null;
  imageUrl: string | null;
}

interface MenuItem {
  id: string;
  slug?: string | null;
  name: string;
  description: string | null;
  price: number;
  compareAtPrice?: number | null;
  foodType: string;
  timeSlot: string;
  isAvailable: boolean;
  avgRating: number | null;
  totalReviews: number;
  orderCount?: number;
  bestseller?: boolean;
  cuisine?: string | null;
  highlights?: MenuItemHighlight[];
  aboutTitle?: string | null;
  aboutDescription?: string | null;
  serves?: number | null;
  portionSize?: string | null;
  shelfLife?: string | null;
  allergens?: string | null;
  deliveryTimeMin?: number | null;
  deliveryTimeMax?: number | null;
  deliveryFee?: number | null;
  freeDelivery?: boolean;
  packagingType?: string | null;
  relatedItems?: RelatedMenuItem[];
  menu: { kitchenPartner: { kitchenAlias: { displayName: string } | null } | null } | null;
  kitchen?: {
    name: string;
    slug: string;
    imageUrl: string | null;
    avgRating: number | null;
    totalReviews: number;
    orderCount: number;
  } | null;
  photos: MenuItemPhoto[];
}

interface MenuItemDetailProps {
  item: MenuItem;
  kitchenSlug?: string;
  itemIdentifier?: string;
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function formatReviewDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function ReviewStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${s <= rating ? "fill-[#F44A01] text-[#F44A01]" : "text-[#E8E8E8]"}`}
        />
      ))}
    </div>
  );
}

function MenuItemDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 md:pb-10 font-sans">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="pt-1 pb-3 flex gap-2 items-center">
          <Skeleton className="h-4 w-12 rounded" />
          <Skeleton className="h-3.5 w-3.5 rounded-full" />
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-3.5 w-3.5 rounded-full" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>

        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-x-8 gap-y-10 mt-2">
          
          {/* Left Col - Images */}
          <div className="lg:col-span-1 xl:col-span-5 flex flex-col gap-4">
            <Skeleton className="w-full aspect-[3/2] rounded-[12px] md:rounded-[16px]" />
            <div className="flex gap-2.5 overflow-x-auto py-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="w-[calc(16.666%-10px)] aspect-square rounded-[8px] flex-shrink-0" />
              ))}
            </div>
          </div>

          {/* Middle Col - Details */}
          <div className="lg:col-span-1 xl:col-span-4 flex flex-col">
            <div className="flex items-center mb-4 gap-3">
              <Skeleton className="h-[20px] w-12 rounded-[4px]" />
              <Skeleton className="h-[14px] w-48 rounded" />
            </div>
            
            <Skeleton className="h-[42px] w-3/4 rounded mb-3" />
            
            <div className="flex flex-col gap-1.5 mb-5 pr-4">
              <Skeleton className="h-[14px] w-full rounded" />
              <Skeleton className="h-[14px] w-full rounded" />
              <Skeleton className="h-[14px] w-4/5 rounded" />
            </div>

            <div className="flex flex-wrap gap-2.5 mb-7">
              <Skeleton className="h-[28px] w-24 rounded-[8px]" />
              <Skeleton className="h-[28px] w-20 rounded-[8px]" />
              <Skeleton className="h-[28px] w-28 rounded-[8px]" />
            </div>

            <div className="flex flex-col gap-1.5 mb-5">
              <Skeleton className="h-[34px] w-32 rounded" />
              <Skeleton className="h-[12px] w-24 rounded" />
            </div>

            <div className="flex items-center gap-3 mb-6">
              <Skeleton className="h-[48px] w-[110px] rounded-[8px]" />
              <Skeleton className="flex-1 h-[48px] rounded-[8px]" />
            </div>

            <Skeleton className="h-[52px] w-full rounded-[8px] mt-2 mb-6" />
          </div>

          {/* Right Col - Delivery Details */}
          <div className="lg:col-span-2 xl:col-span-3 xl:pl-4 mt-2 lg:mt-6 xl:mt-0 flex flex-col">
            <div className="hidden lg:flex items-center justify-between mb-4 w-full">
              <Skeleton className="h-[28px] w-[120px] rounded-[5px]" />
              <Skeleton className="h-[28px] w-[80px] rounded-[5px]" />
            </div>
            <div className="w-full mx-auto max-w-md xl:max-w-none">
              <Skeleton className="h-[320px] w-full rounded-[12px]" />
            </div>
          </div>
        </div>

        {/* Feature Banner - Highlights */}
        <Skeleton className="my-10 h-[88px] w-full rounded-[12px]" />

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-12 gap-8">
          <div className="lg:col-span-2 xl:col-span-8 flex flex-col gap-8">
            <div className="flex gap-8 border-b border-[#EEEEEE] pb-1">
              <Skeleton className="h-[36px] w-24 rounded-none" />
              <Skeleton className="h-[36px] w-24 rounded-none" />
              <Skeleton className="h-[36px] w-24 rounded-none" />
              <Skeleton className="h-[36px] w-24 rounded-none" />
            </div>
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 lg:max-w-[40%] flex flex-col gap-3">
                <Skeleton className="h-[24px] w-32 rounded" />
                <Skeleton className="h-[14px] w-full rounded" />
                <Skeleton className="h-[14px] w-full rounded" />
                <Skeleton className="h-[14px] w-4/5 rounded" />
              </div>
              <Skeleton className="flex-1 h-[140px] rounded-[12px]" />
            </div>
          </div>
          <div className="lg:col-span-1 xl:col-span-4 hidden lg:block">
             <Skeleton className="w-full h-[400px] rounded-[12px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface KitchenProfileProps {
  kitchenName: string;
  imageUrl: string | null;
  avgRating: number | null;
  totalReviews: number;
  orderCount: number;
  kitchenSlug?: string;
  distanceKm?: number;
}

function KitchenProfile({ kitchenName, imageUrl, avgRating, totalReviews, orderCount, kitchenSlug, distanceKm = 2.5 }: KitchenProfileProps) {
  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-5">
        <div className="relative">
          <Avatar className="h-[68px] w-[68px] border border-[#E7E7E7] bg-white text-white shadow-sm shrink-0 overflow-hidden">
            {imageUrl ? (
              <AvatarImage src={imageUrl} alt={kitchenName} className="object-cover" />
            ) : null}
            <AvatarFallback className="bg-gray-100 text-[#00512F] font-bold text-[18px]">
              {kitchenName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <div>
          <h3 className="font-bold text-[17px] text-[#111111] flex items-center gap-1.5">
            {kitchenName}
            <BadgeCheck className="h-4 w-4 text-[#08733F] fill-[#08733F] text-white" />
          </h3>
          <p className="text-[#08733F] text-[13px] font-medium mt-0.5 mb-1.5">Home Chef</p>
          <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#111111]">
            {avgRating != null ? (
              <>
                <Star className="h-3.5 w-3.5 fill-[#08733F] text-[#08733F]" />
                <span>{avgRating.toFixed(1)}</span>
                <span className="text-[#666666] font-normal">({formatCompact(totalReviews)} reviews)</span>
              </>
            ) : (
              <span className="text-[#666666] font-medium">New on RRC Kitchen</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-[#E7E7E7] text-center mb-6 py-4">
        <div className="flex flex-col items-center justify-center">
          <p className="font-bold text-[15px] text-[#111111]">{orderCount > 0 ? `${formatCompact(orderCount)}+` : "—"}</p>
          <p className="text-[11px] text-[#666666] mt-0.5">Orders</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="font-bold text-[15px] text-[#111111]">98%</p>
          <p className="text-[11px] text-[#666666] mt-0.5">On-time Delivery</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="font-bold text-[15px] text-[#111111]">{distanceKm} km</p>
          <p className="text-[11px] text-[#666666] mt-0.5">Distance</p>
        </div>
      </div>

      <div className="flex flex-col divide-y divide-[#E7E7E7] border-t border-[#E7E7E7]">
        {kitchenSlug && (
          <Link href={`/kitchens/${kitchenSlug}`} className="w-full flex items-center justify-between py-3.5 group">
            <div className="flex items-center gap-3 text-[13px] font-bold text-[#111111]">
              <ChefHat className="h-[18px] w-[18px] text-[#08733F] stroke-[1.5px]" /> 
              View Kitchen Menu
            </div>
            <ChevronRight className="h-4 w-4 text-[#888888]" />
          </Link>
        )}
        <div className="w-full flex items-center justify-between py-3.5 cursor-pointer group">
          <div className="flex items-center gap-3 text-[13px] font-bold text-[#111111]">
            <Phone className="h-[18px] w-[18px] text-[#666666] group-hover:text-[#F44A01] transition-colors stroke-[1.5px]" /> 
            Contact Kitchen
          </div>
          <ChevronRight className="h-4 w-4 text-[#888888]" />
        </div>
        <div className="w-full flex items-center justify-between py-3.5 cursor-pointer group">
          <div className="flex items-center gap-3">
             <div className="flex flex-col">
                <div className="flex items-center gap-3 text-[13px] font-bold text-[#111111]">
                  <Package className="h-[18px] w-[18px] text-[#666666] group-hover:text-[#F44A01] transition-colors stroke-[1.5px]" /> 
                  Kitchen FSSAI
                </div>
                <span className="text-[10px] text-[#888888] ml-[30px] font-medium">12423012000125</span>
             </div>
          </div>
          <ChevronRight className="h-4 w-4 text-[#888888]" />
        </div>
        <div className="w-full flex items-center justify-between py-3.5 cursor-pointer group">
          <div className="flex items-center gap-3">
             <div className="flex flex-col">
                <div className="flex items-center gap-3 text-[13px] font-bold text-[#111111]">
                  <ShieldCheck className="h-[18px] w-[18px] text-[#08733F] stroke-[1.5px]" /> 
                  Kitchen Hygiene
                </div>
                <span className="text-[10px] text-[#888888] ml-[30px] font-medium">Certified</span>
             </div>
          </div>
          <ChevronRight className="h-4 w-4 text-[#888888]" />
        </div>
      </div>
    </div>
  );
}

export function MenuItemDetail({ item, kitchenSlug, itemIdentifier }: MenuItemDetailProps) {
  const { data: currentItem, isPending } = useQuery({
    queryKey: ["menu-item", kitchenSlug, itemIdentifier],
    queryFn: async () => {
      if (kitchenSlug && itemIdentifier) {
        const result = await getMenuItemByIdentifierClient(kitchenSlug, itemIdentifier);
        return result as unknown as MenuItem | null;
      }
      return null;
    },
    initialData: item,
    enabled: !!kitchenSlug && !!itemIdentifier,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const displayItem = currentItem || item;

  const [imageIndex, setImageIndex] = useState(0);
  const [locationOpen, setLocationOpen] = useState(false);
  const [popupItem, setPopupItem] = useState<AddPopupItem | null>(null);

  const { addToCart, updateQuantity, removeFromCart } = useCartActions();
  const cartItems = useCartItems();
  const cartItem = cartItems.find(ci => ci.id === displayItem.id);
  const deliveryAddress = useMenuDeliveryAddress();

  const kitchen = displayItem.kitchen ?? null;
  const kitchenName = kitchen?.name ?? displayItem.menu?.kitchenPartner?.kitchenAlias?.displayName ?? "Kitchen";
  const price = Number(displayItem.price);
  const hasDiscount = displayItem.compareAtPrice != null && displayItem.compareAtPrice > price;
  const mrp = displayItem.compareAtPrice ?? price;
  const offAmount = mrp - price;
  const discountPercent = Math.round((offAmount / mrp) * 100);

  const sortedPhotos = useMemo(
    () => [...(displayItem.photos ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [displayItem.photos]
  );

  const handlePrevImage = useCallback(() => {
    setImageIndex((i) => (i > 0 ? i - 1 : sortedPhotos.length - 1));
  }, [sortedPhotos.length]);

  const handleNextImage = useCallback(() => {
    setImageIndex((i) => (i < sortedPhotos.length - 1 ? i + 1 : 0));
  }, [sortedPhotos.length]);

  const showPopupForItem = useCallback(() => {
    setPopupItem({
      id: displayItem.id,
      name: displayItem.name,
      price,
      compareAtPrice: displayItem.compareAtPrice ?? null,
      foodType: displayItem.foodType,
      imageUrl: displayItem.photos?.find((p) => p.imageUrl)?.imageUrl ?? null,
      kitchenName,
      timeSlot: displayItem.timeSlot,
    });
  }, [displayItem, price, kitchenName]);

  const handleAdd = () => {
    if (!displayItem.isAvailable) return;
    if (cartItem) {
      updateQuantity(displayItem.id, cartItem.qty + 1);
    } else {
      addToCart({
        id: displayItem.id,
        name: displayItem.name,
        price,
        qty: 1,
        foodType: displayItem.foodType,
        imageUrl: displayItem.photos?.find((p) => p.imageUrl)?.imageUrl ?? undefined,
        kitchenName,
        timeSlot: displayItem.timeSlot,
      });
    }
    showPopupForItem();
  };

  const handleRemove = () => {
    if (cartItem && cartItem.qty > 1) {
      updateQuantity(displayItem.id, cartItem.qty - 1);
    } else if (cartItem) {
      removeFromCart(displayItem.id);
    }
  };

  const deliveryTime =
    displayItem.deliveryTimeMin != null
      ? `${displayItem.deliveryTimeMin} - ${displayItem.deliveryTimeMax || displayItem.deliveryTimeMin + 10} mins`
      : "25 - 35 mins"; // Fallback to match UI

  const aboutTitle = displayItem.aboutTitle ?? `About this dish`;
  const aboutDescription = displayItem.aboutDescription ?? `Our ${displayItem.name} is a perfect blend of fragrant basmati rice, juicy chicken pieces, caramelized onions, and handcrafted spices. Cooked dum-style to bring out rich flavors in every bite.`;

  const totalReviews = displayItem.totalReviews || 0;
  const orderCount = displayItem.orderCount || 0;

  const kitchenAvgRating = kitchen?.avgRating ?? displayItem.avgRating ?? 4.7;
  const kitchenTotalReviews = kitchen?.totalReviews ?? totalReviews;
  const kitchenOrderCount = kitchen?.orderCount ?? orderCount;

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: displayItem.name,
          text: `${displayItem.name} — ${kitchenName} on RRC Kitchen`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      // user dismissed the share sheet
    }
  }, [displayItem.name, kitchenName]);

  const reviewsQuery = useInfiniteQuery({
    queryKey: ["menu-item-reviews", displayItem.id],
    queryFn: ({ pageParam }) => getMenuItemReviews(displayItem.id, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
  });

  const allReviews = useMemo(
    () => reviewsQuery.data?.pages.flatMap((p) => p.reviews) ?? [],
    [reviewsQuery.data]
  );

  const reviewsScrollRef = useRef<HTMLDivElement>(null);
  const reviewsSentinelRef = useRef<HTMLDivElement>(null);

  const reviewVirtualizer = useVirtualizer({
    count: allReviews.length,
    getScrollElement: () => reviewsScrollRef.current,
    estimateSize: () => 120,
    overscan: 6,
  });

  useEffect(() => {
    const sentinel = reviewsSentinelRef.current;
    if (!sentinel || !reviewsQuery.hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !reviewsQuery.isFetchingNextPage) {
          reviewsQuery.fetchNextPage();
        }
      },
      { root: reviewsScrollRef.current, rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [reviewsQuery, allReviews.length]);

  if (isPending && !displayItem) {
    return <MenuItemDetailSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 md:pb-10 font-sans">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="pt-1 pb-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-[#555555] font-medium text-[13px] hover:text-[#111111]">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-[#AAAAAA]" />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/kitchens/${kitchenSlug || displayItem.kitchen?.slug || ''}`} className="text-[#555555] font-medium text-[13px] hover:text-[#111111]">{kitchenName}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-[#AAAAAA]" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[#00512F] font-bold text-[13px]">{displayItem.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-x-8 gap-y-10 mt-2">

          {/* Left Col - Images */}
          <div className="lg:col-span-1 xl:col-span-5 flex flex-col gap-4">
            <div className="relative w-full aspect-[3/2] rounded-[12px] md:rounded-[16px] overflow-hidden bg-muted group shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
              {sortedPhotos.length > 0 ? (
                <ProgressiveImage
                  highResUrl={sortedPhotos[imageIndex].imageUrl}
                  alt={displayItem.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground bg-[#F5F8F2]">No image</div>
              )}

              {/* Badges on Image */}
              {displayItem.bestseller !== false && (
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-[#FF4D00] text-white px-3 py-1 text-[12px] font-bold rounded-[6px] shadow-sm">
                    Bestseller
                  </div>
                </div>
              )}
              <div className="absolute top-2 right-2 z-10">
                <WishlistButton 
                  menuItemId={displayItem.id} 
                  size="lg" 
                  className="hover:scale-110 transition-transform"
                />
              </div>

              {/* Controls */}
              {sortedPhotos.length > 1 && (
                <>
                  <button onClick={handlePrevImage} className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.15)] flex items-center justify-center text-[#111111] hover:bg-gray-50 transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={handleNextImage} className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.15)] flex items-center justify-center text-[#111111] hover:bg-gray-50 transition-colors">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white text-[11px] font-bold px-2.5 py-1 rounded-[6px] backdrop-blur-sm tracking-wide">
                    {imageIndex + 1} / {sortedPhotos.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {sortedPhotos.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto py-1 scrollbar-hide">
                {sortedPhotos.map((photo, idx) => (
                  <button
                    key={photo.id || idx}
                    onClick={() => setImageIndex(idx)}
                    className={`relative w-[calc(16.666%-10px)] aspect-square rounded-[8px] flex-shrink-0 transition-all p-[2px] bg-white ${
                      imageIndex === idx 
                      ? 'border-[2px] border-[#FF4D00] opacity-100 shadow-sm' 
                      : 'border-[2px] border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="relative w-full h-full rounded-[4px] overflow-hidden">
                      <ProgressiveImage highResUrl={photo.imageUrl} alt="" fill className="object-cover" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Middle Col - Details & Add to Cart */}
          <div className="lg:col-span-1 xl:col-span-4 flex flex-col">
            
            {/* Top Row: Ratings, Reviews, Orders */}
            <div className="flex items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-[#00512F] text-white px-2 py-0.5 rounded-[4px] text-[12px] font-bold">
                  <Star className="h-3 w-3 fill-current" />
                  <span>{displayItem.avgRating?.toFixed(1) || "4.8"}</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-[#666666] font-medium">
                  <span>({formatCompact(totalReviews)} reviews)</span>
                  <span className="text-[#DDDDDD]">|</span>
                  <span className="text-[#111111]">{formatCompact(orderCount)}+ orders</span>
                </div>
              </div>
            </div>

            {/* Title & Description */}
            <h1 className="text-[34px] font-extrabold tracking-tight text-[#00512F] leading-tight mb-3">
              {displayItem.name}
            </h1>
            <p className="text-[14px] text-[#555555] font-medium leading-[1.6] mb-5 pr-4">
              {displayItem.description || aboutDescription}
            </p>

            {/* Attributes row */}
            <div className="flex flex-wrap items-center gap-2.5 mb-7">
              {displayItem.cuisine && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#EEEEEE] rounded-[8px]">
                  <Utensils className="h-4 w-4 text-[#08733F] stroke-[2px]" />
                  <span className="text-[12px] font-medium text-[#444444]">{displayItem.cuisine} Style</span>
                </div>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#EEEEEE] rounded-[8px]">
                <Flame className="h-4 w-4 text-[#F44A01] stroke-[2px]" />
                <span className="text-[12px] font-medium text-[#444444]">Non-Veg</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#EEEEEE] rounded-[8px]">
                <Flame className="h-4 w-4 text-[#F44A01] stroke-[2px]" />
                <span className="text-[12px] font-medium text-[#444444]">Medium Spicy</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#EEEEEE] rounded-[8px]">
                <Clock className="h-4 w-4 text-[#08733F] stroke-[2px]" />
                <span className="text-[12px] font-medium text-[#444444]">Lunch & Dinner</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="flex flex-col gap-1.5 mb-5">
              <div className="flex items-end gap-3">
                <span className="text-[34px] font-extrabold tracking-tight text-[#FF4D00] leading-none">₹{price}</span>
                {hasDiscount && (
                  <>
                    <span className="text-[18px] text-[#888888] font-bold line-through decoration-[#888888]/50 leading-none mb-1">₹{mrp}</span>
                    <Badge className="bg-[#EAF5EF] text-[#08733F] hover:bg-[#EAF5EF] border-none font-bold text-[12px] px-2.5 py-1 rounded-full mb-1.5 shadow-none tracking-wide">{discountPercent}% OFF</Badge>
                  </>
                )}
              </div>
              <p className="text-[11px] text-[#666666] font-medium">Inclusive of all taxes</p>
            </div>

            {/* Add to Cart Area */}
            <div className="flex items-center gap-3 mb-6">
              {cartItem ? (
                <div className="flex items-center border border-[#E7E7E7] rounded-[8px] overflow-hidden h-[48px] w-[110px] shrink-0 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                  <button onClick={handleRemove} className="flex-1 flex items-center justify-center text-[#111111] hover:bg-gray-50 h-full">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-bold text-[15px] w-8 text-center text-[#111111]">{cartItem.qty}</span>
                  <button onClick={handleAdd} className="flex-1 flex items-center justify-center text-[#111111] hover:bg-gray-50 h-full">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center border border-[#E7E7E7] rounded-[8px] overflow-hidden h-[48px] w-[110px] shrink-0 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                  <button disabled className="flex-1 flex items-center justify-center text-[#CCCCCC] h-full">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-bold text-[15px] w-8 text-center text-[#111111]">1</span>
                  <button onClick={handleAdd} className="flex-1 flex items-center justify-center text-[#111111] hover:bg-gray-50 h-full">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              )}
              <Button onClick={handleAdd} disabled={!displayItem.isAvailable} className="flex-1 h-[48px] bg-[#FF4D00] hover:bg-[#E94300] text-white font-bold text-[16px] rounded-[8px] shadow-[0_2px_8px_rgba(244,74,1,0.25)] transition-all">
                <ShoppingCart className="h-5 w-5 mr-2 stroke-[2px]" />
                {displayItem.isAvailable ? "Add to Cart" : "Unavailable"}
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center bg-[#FDFDFD] border border-[#EEEEEE] rounded-[8px] p-2.5 divide-x divide-[#EEEEEE] mt-2 mb-6">
              <div className="flex items-center gap-2.5 flex-1 px-3 first:pl-1">
                <Users className="w-5 h-5 text-[#08733F] shrink-0 stroke-[1.5px]" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[#111111]">32 people</span>
                  <span className="text-[10px] text-[#666666]">added this in the last 1 hour</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 flex-1 px-3">
                <Timer className="w-5 h-5 text-[#08733F] shrink-0 stroke-[1.5px]" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[#111111]">Extra ₹10 off</span>
                  <span className="text-[10px] text-[#666666]">on online payment</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 flex-1 px-3 pr-1">
                <Package className="w-5 h-5 text-[#08733F] shrink-0 stroke-[1.5px]" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[#111111]">Secure Packaging</span>
                  <span className="text-[10px] text-[#666666]">Leak-proof & safe delivery</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col - Delivery Details */}
          <div className="lg:col-span-2 xl:col-span-3 xl:pl-4 mt-2 lg:mt-6 xl:mt-0 flex flex-col">
            <div className="hidden lg:flex items-center justify-between mb-4 w-full">
              <Badge variant="outline" className="h-[28px] px-2.5 bg-[#F5F8F2] border-[#DCE8DC] text-[#155B38] text-[11px] font-bold rounded-[5px] flex items-center gap-1.5 shadow-none">
                <ShieldCheck className="h-3.5 w-3.5 stroke-[2px]" /> Hygienic Kitchen
              </Badge>
              <Button onClick={handleShare} variant="outline" className="h-[28px] px-3 border-[#F44A01] text-[#F44A01] text-[11px] font-bold rounded-[5px] flex items-center gap-1.5 bg-transparent hover:bg-[#FFF1EB] hover:text-[#F44A01] shadow-none cursor-pointer z-10">
                <Share2 className="h-3.5 w-3.5" /> Share
              </Button>
            </div>

            <div className="w-full mx-auto max-w-md xl:max-w-none">
              <Card className="shadow-[0_2px_12px_rgba(0,0,0,0.04)] border-[#EAEAEA] rounded-[12px] bg-white">
                <CardContent className="p-5">
                  <h3 className="font-bold text-[16px] text-[#00512F] mb-5">Delivery Details</h3>

                <div className="space-y-5">
                  {/* Delivery Time */}
                  <div className="flex items-start gap-3">
                    <div className="w-[34px] h-[34px] bg-[#F5F8F2] rounded-full flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-[#08733F] stroke-[2px]" />
                    </div>
                    <div className="flex-1 mt-0.5">
                      <p className="text-[12px] text-[#666666] font-medium">Delivery Time</p>
                      <p className="text-[14px] font-bold text-[#111111] my-0.5">{deliveryTime}</p>
                      <p className="text-[11px] font-bold text-[#08733F]">Express Delivery</p>
                    </div>
                    <Bike className="w-5 h-5 text-[#08733F] stroke-[1.5px] self-center shrink-0" />
                  </div>

                  <Separator className="bg-[#EEEEEE]" />

                  {/* Delivery To */}
                  <div className="flex items-start gap-3">
                    <div className="w-[34px] h-[34px] bg-[#F5F8F2] rounded-full flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-[#08733F] stroke-[2px]" />
                    </div>
                    <div className="flex-1 pr-2 mt-0.5">
                      <p className="text-[12px] text-[#666666] font-medium">Deliver to</p>
                      <p className="text-[13px] font-bold text-[#111111] leading-snug mt-0.5">{deliveryAddress || "Anna Nagar, Chennai 600040"}</p>
                    </div>
                    <button onClick={() => setLocationOpen(true)} className="text-[12px] font-bold text-[#08733F] hover:underline self-center shrink-0">Change</button>
                  </div>

                  <Separator className="bg-[#EEEEEE]" />

                  {/* Delivery Fee */}
                  <div className="flex items-start gap-3">
                    <div className="w-[34px] h-[34px] bg-[#F5F8F2] rounded-full flex items-center justify-center shrink-0">
                      <Truck className="w-4 h-4 text-[#08733F] stroke-[2px]" />
                    </div>
                    <div className="flex-1 mt-0.5">
                      <p className="text-[12px] text-[#666666] font-medium">Delivery Fee</p>
                      <p className="text-[13px] font-bold text-[#111111] mt-0.5">{displayItem.deliveryFee != null ? `₹${displayItem.deliveryFee}+ order` : "₹149+ order"}</p>
                    </div>
                    <span className="text-[11px] font-bold text-[#08733F] self-center shrink-0">{displayItem.freeDelivery ? "Free delivery" : "Free delivery"}</span>
                  </div>

                  <Separator className="bg-[#EEEEEE]" />

                  {/* Available */}
                  <div className="flex items-start gap-3">
                    <div className="w-[34px] h-[34px] bg-[#F5F8F2] rounded-full flex items-center justify-center shrink-0">
                      <Utensils className="w-4 h-4 text-[#08733F] stroke-[2px]" />
                    </div>
                    <div className="flex-1 mt-0.5">
                      <p className="text-[12px] text-[#666666] font-medium">Available</p>
                      <p className="text-[13px] font-bold text-[#111111] mt-0.5">Lunch • Dinner</p>
                      <p className="text-[11px] font-bold text-[#08733F] mt-0.5">11:00 AM – 10:30 PM</p>
                    </div>
                  </div>
                </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Feature Banner - Highlights (Full Width) */}
        <div className="my-10 bg-[#FDFDFD] border border-[#EEEEEE] rounded-[12px] py-6 px-6 sm:px-10 flex overflow-x-auto scrollbar-hide snap-x gap-6 sm:gap-8 xl:justify-between divide-x divide-[#EEEEEE]">
          <div className="flex items-center gap-3.5 min-w-[max-content] snap-start shrink-0">
            <Heart className="h-6 w-6 text-[#08733F] stroke-[1.5px]" />
            <div className="flex flex-col">
              <span className="font-bold text-[12px] text-[#111111]">100% Homemade</span>
              <span className="text-[11px] font-medium text-[#666666]">Made with love</span>
            </div>
          </div>
          <div className="flex items-center gap-3.5 min-w-[max-content] snap-start shrink-0 pl-6 sm:pl-8">
            <Leaf className="h-6 w-6 text-[#08733F] stroke-[1.5px]" />
            <div className="flex flex-col">
              <span className="font-bold text-[12px] text-[#111111]">Fresh Ingredients</span>
              <span className="text-[11px] font-medium text-[#666666]">Sourced daily</span>
            </div>
          </div>
          <div className="flex items-center gap-3.5 min-w-[max-content] snap-start shrink-0 pl-6 sm:pl-8">
            <ShieldCheck className="h-6 w-6 text-[#08733F] stroke-[1.5px]" />
            <div className="flex flex-col">
              <span className="font-bold text-[12px] text-[#111111]">Hygienic Kitchen</span>
              <span className="text-[11px] font-medium text-[#666666]">FSSAI Certified</span>
            </div>
          </div>
          <div className="flex items-center gap-3.5 min-w-[max-content] snap-start shrink-0 pl-6 sm:pl-8">
            <Package className="h-6 w-6 text-[#FF4D00] stroke-[1.5px]" />
            <div className="flex flex-col">
              <span className="font-bold text-[12px] text-[#111111]">Perfectly Packed</span>
              <span className="text-[11px] font-medium text-[#666666]">Leak-proof pack</span>
            </div>
          </div>
          <div className="flex items-center gap-3.5 min-w-[max-content] snap-start shrink-0 pl-6 sm:pl-8">
            <Users className="h-6 w-6 text-[#FF4D00] stroke-[1.5px]" />
            <div className="flex flex-col">
              <span className="font-bold text-[12px] text-[#111111]">Support Local Women</span>
              <span className="text-[11px] font-medium text-[#666666]">Empowering homemakers</span>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-12 gap-8">

          {/* Tabs Section */}
          <div className="lg:col-span-2 xl:col-span-8">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-[#EEEEEE] rounded-none flex-nowrap overflow-x-auto scrollbar-hide gap-8 outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus:ring-0 ring-0">
                <TabsTrigger value="overview" className="bg-transparent shadow-none !border-t-0 !border-l-0 !border-r-0 !border-b-[3px] !border-b-transparent data-[state=active]:!border-b-[#08733F] data-[state=active]:bg-transparent rounded-none px-1 py-3 font-bold flex items-center gap-2 text-[#666666] data-[state=active]:text-[#08733F] text-[13px] tracking-wide transition-colors !outline-none focus:!outline-none focus:!ring-0 focus-visible:!outline-none focus-visible:!ring-0 !ring-0 group data-[state=active]:shadow-none mb-[-1px]">
                  <ClipboardList className="h-4 w-4 group-data-[state=active]:fill-[#08733F] group-data-[state=active]:text-[#08733F] text-current stroke-[1.5px]" /> Overview
                </TabsTrigger>
                <TabsTrigger value="ingredients" className="bg-transparent shadow-none !border-t-0 !border-l-0 !border-r-0 !border-b-[3px] !border-b-transparent data-[state=active]:!border-b-[#08733F] data-[state=active]:bg-transparent rounded-none px-1 py-3 font-bold flex items-center gap-2 text-[#666666] data-[state=active]:text-[#08733F] text-[13px] tracking-wide transition-colors !outline-none focus:!outline-none focus:!ring-0 focus-visible:!outline-none focus-visible:!ring-0 !ring-0 group data-[state=active]:shadow-none mb-[-1px]">
                  <Sparkles className="h-4 w-4 group-data-[state=active]:fill-[#08733F] group-data-[state=active]:text-[#08733F] text-current stroke-[1.5px]" /> Ingredients
                </TabsTrigger>
                <TabsTrigger value="nutrition" className="bg-transparent shadow-none !border-t-0 !border-l-0 !border-r-0 !border-b-[3px] !border-b-transparent data-[state=active]:!border-b-[#08733F] data-[state=active]:bg-transparent rounded-none px-1 py-3 font-bold flex items-center gap-2 text-[#666666] data-[state=active]:text-[#08733F] text-[13px] tracking-wide transition-colors !outline-none focus:!outline-none focus:!ring-0 focus-visible:!outline-none focus-visible:!ring-0 !ring-0 group data-[state=active]:shadow-none mb-[-1px]">
                  <Dna className="h-4 w-4 group-data-[state=active]:text-[#08733F] text-current stroke-[1.5px]" /> Nutrition
                </TabsTrigger>
                <TabsTrigger value="reviews" className="bg-transparent shadow-none !border-t-0 !border-l-0 !border-r-0 !border-b-[3px] !border-b-transparent data-[state=active]:!border-b-[#08733F] data-[state=active]:bg-transparent rounded-none px-1 py-3 font-bold flex items-center gap-2 text-[#666666] data-[state=active]:text-[#08733F] text-[13px] tracking-wide transition-colors !outline-none focus:!outline-none focus:!ring-0 focus-visible:!outline-none focus-visible:!ring-0 !ring-0 group data-[state=active]:shadow-none mb-[-1px]">
                  <Star className="h-4 w-4 group-data-[state=active]:fill-[#08733F] group-data-[state=active]:text-[#08733F] text-current stroke-[1.5px]" /> Reviews ({totalReviews})
                </TabsTrigger>
                <TabsTrigger value="kitchen" className="bg-transparent shadow-none !border-t-0 !border-l-0 !border-r-0 !border-b-[3px] !border-b-transparent data-[state=active]:!border-b-[#08733F] data-[state=active]:bg-transparent rounded-none px-1 py-3 font-bold flex items-center gap-2 text-[#666666] data-[state=active]:text-[#08733F] text-[13px] tracking-wide transition-colors !outline-none focus:!outline-none focus:!ring-0 focus-visible:!outline-none focus-visible:!ring-0 !ring-0 group data-[state=active]:shadow-none mb-[-1px] lg:hidden">
                  <Gift className="h-4 w-4 group-data-[state=active]:fill-[#08733F] group-data-[state=active]:text-[#08733F] text-current stroke-[1.5px]" /> Kitchen Info
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="pt-8 space-y-10 animate-in fade-in duration-300">
                {/* About this dish & Quick Facts */}
                <div className="flex flex-col lg:flex-row gap-8">
                   <div className="flex-1 lg:max-w-[40%] pr-4">
                     <h3 className="text-[18px] font-bold text-[#111111] mb-3">{aboutTitle}</h3>
                     <p className="text-[13px] text-[#555555] font-medium leading-[1.6]">
                       {aboutDescription}
                     </p>
                   </div>

                   <div className="flex-1 bg-[#F9F9F9] border border-[#EEEEEE] rounded-[12px] p-4 lg:p-5">
                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 h-full divide-x divide-[#EEEEEE]">
                       <div className="flex flex-col justify-center px-1 lg:px-3">
                         <div className="flex items-center gap-2 mb-1">
                           <Users className="h-4 w-4 text-[#08733F]" strokeWidth={2} />
                           <p className="text-[11px] font-bold text-[#666666]">Serves</p>
                         </div>
                         <p className="font-bold text-[13px] text-[#111111]">{displayItem.serves != null ? `${displayItem.serves} Person` : "1 Person"}</p>
                       </div>
                       <div className="flex flex-col justify-center px-2 lg:px-4">
                         <div className="flex items-center gap-2 mb-1">
                           <Scale className="h-4 w-4 text-[#08733F]" strokeWidth={2} />
                           <p className="text-[11px] font-bold text-[#666666]">Portion Size</p>
                         </div>
                         <p className="font-bold text-[13px] text-[#111111]">{displayItem.portionSize || "400 - 450 gms"}</p>
                       </div>
                       <div className="flex flex-col justify-center px-2 lg:px-4">
                         <div className="flex items-center gap-2 mb-1">
                           <Timer className="h-4 w-4 text-[#08733F]" strokeWidth={2} />
                           <p className="text-[11px] font-bold text-[#666666]">Shelf Life</p>
                         </div>
                         <p className="font-bold text-[13px] text-[#111111] leading-tight">{displayItem.shelfLife || "Best consumed hot"}</p>
                       </div>
                       <div className="flex flex-col justify-center px-2 lg:px-4">
                         <div className="flex items-center gap-2 mb-1">
                           <AlertTriangle className="h-4 w-4 text-[#F44A01]" strokeWidth={2} />
                           <p className="text-[11px] font-bold text-[#F44A01]">Allergens</p>
                         </div>
                         <p className="font-bold text-[13px] text-[#111111] leading-tight">{displayItem.allergens || "May contain nuts"}</p>
                       </div>
                     </div>
                   </div>
                </div>

                {/* You may also like */}
                {(displayItem.relatedItems ?? [
                  { id: "1", name: "Mutton Biryani", price: 229, avgRating: 4.7, imageUrl: "/food1.jpg" },
                  { id: "2", name: "Paneer Biryani", price: 179, avgRating: 4.6, imageUrl: "/food2.jpg" },
                  { id: "3", name: "Egg Biryani", price: 159, avgRating: 4.5, imageUrl: "/food3.jpg" },
                  { id: "4", name: "Veg Biryani", price: 149, avgRating: 4.4, imageUrl: "/food4.jpg" }
                ]).length > 0 && (
                  <div>
                    <h3 className="text-[18px] font-bold text-[#111111] mb-5">You may also like</h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                      {displayItem.relatedItems?.length ? displayItem.relatedItems.map((sim) => (
                        <div key={sim.id} className="min-w-[190px] max-w-[190px] flex-shrink-0 cursor-pointer overflow-hidden group border border-[#EEEEEE] rounded-[10px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow flex items-center justify-between">
                          <div className="relative h-[72px] w-[72px] bg-muted shrink-0 border-r border-[#EEEEEE]">
                            {sim.imageUrl && <ProgressiveImage highResUrl={sim.imageUrl} alt={sim.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />}
                          </div>
                          <div className="p-2 px-3 flex-1 flex flex-col justify-center bg-white h-full">
                            <h4 className="font-bold text-[12px] text-[#111111] mb-1 truncate">{sim.name}</h4>
                            <div className="flex items-center justify-between mt-auto">
                              <span className="font-extrabold text-[12px] text-[#111111]">₹{sim.price}</span>
                              {sim.avgRating != null && (
                                <div className="flex items-center gap-0.5 text-[10px] font-bold text-[#08733F]">
                                  <Star className="h-2.5 w-2.5 fill-current" />
                                  <span>{sim.avgRating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )) : (
                        [
                          { id: "1", name: "Mutton Biryani", price: 229, avgRating: 4.7, imageUrl: "/api/placeholder/400/400" },
                          { id: "2", name: "Paneer Biryani", price: 179, avgRating: 4.6, imageUrl: "/api/placeholder/400/400" },
                          { id: "3", name: "Egg Biryani", price: 159, avgRating: 4.5, imageUrl: "/api/placeholder/400/400" },
                          { id: "4", name: "Veg Biryani", price: 149, avgRating: 4.4, imageUrl: "/api/placeholder/400/400" }
                        ].map((sim) => (
                        <div key={sim.id} className="min-w-[190px] max-w-[190px] flex-shrink-0 cursor-pointer overflow-hidden group border border-[#EEEEEE] rounded-[10px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow flex">
                          <div className="relative h-[72px] w-[72px] bg-muted shrink-0 border-r border-[#EEEEEE]">
                            {sim.imageUrl && <ProgressiveImage highResUrl={sim.imageUrl} alt={sim.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />}
                          </div>
                          <div className="py-2 px-3 flex-1 flex flex-col bg-white justify-center gap-1">
                            <h4 className="font-bold text-[12px] text-[#111111] line-clamp-2 leading-tight">{sim.name}</h4>
                            <div className="flex items-center justify-between mt-auto">
                              <span className="font-extrabold text-[12px] text-[#111111]">₹{sim.price}</span>
                              {sim.avgRating != null && (
                                <div className="flex items-center gap-0.5 text-[10px] font-bold text-[#08733F]">
                                  <Star className="h-2.5 w-2.5 fill-current" />
                                  <span>{sim.avgRating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        ))
                      )}
                      
                      <button className="h-[68px] w-8 bg-white border border-[#EEEEEE] rounded-[10px] shadow-sm flex items-center justify-center shrink-0 hover:bg-gray-50 self-center transition-colors">
                        <ChevronRight className="h-4 w-4 text-[#555555]" />
                      </button>
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="ingredients" className="pt-8">
                 <p className="text-[#555555] font-medium text-[14px]">Detailed ingredients information will be displayed here.</p>
              </TabsContent>
              <TabsContent value="nutrition" className="pt-8">
                 <p className="text-[#555555] font-medium text-[14px]">Nutritional values and calories information will be displayed here.</p>
              </TabsContent>
              <TabsContent value="reviews" className="pt-8 animate-in fade-in duration-300">
                {reviewsQuery.isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex gap-3 p-4 bg-white border border-[#EEEEEE] rounded-[12px] shadow-sm animate-pulse">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2 pt-1">
                          <Skeleton className="h-3 w-32" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-2/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : allReviews.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-14 text-center">
                    <Star className="h-10 w-10 text-[#CCCCCC]" />
                    <p className="font-bold text-[#111111]">No reviews yet</p>
                    <p className="text-[13px] text-[#666666] max-w-xs font-medium">Be the first to review this dish after your order.</p>
                  </div>
                ) : (
                  <div ref={reviewsScrollRef} className="relative max-h-[640px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="relative" style={{ height: reviewVirtualizer.getTotalSize() }}>
                      {reviewVirtualizer.getVirtualItems().map((virtualRow) => {
                        const review = allReviews[virtualRow.index];
                        return (
                          <div
                            key={review.id}
                            className="absolute left-0 right-0"
                            style={{ transform: `translateY(${virtualRow.start}px)` }}
                          >
                            <div className="flex items-start gap-4 p-5 bg-white border border-[#EEEEEE] rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] mb-4">
                              <div className="h-11 w-11 rounded-full bg-[#EAF5EF] text-[#08733F] flex items-center justify-center text-[14px] font-bold shrink-0 overflow-hidden relative">
                                {review.user.image ? (
                                  <Image src={review.user.image} alt={review.user.name ?? "Reviewer"} fill sizes="44px" className="object-cover" />
                                ) : review.user.name ? (
                                  <span>{review.user.name.slice(0, 2).toUpperCase()}</span>
                                ) : (
                                  <User className="h-5 w-5" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                                  {review.user.name && <p className="font-bold text-[14px] text-[#111111] truncate">{review.user.name}</p>}
                                  <span className="text-[12px] font-medium text-[#888888]">{formatReviewDate(review.createdAt)}</span>
                                </div>
                                <div className="mb-2.5">
                                  <ReviewStars rating={review.rating} />
                                </div>
                                {review.comment && (
                                  <p className="text-[13px] font-medium text-[#555555] leading-relaxed">{review.comment}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div ref={reviewsSentinelRef} className="h-1" />
                    {reviewsQuery.isFetchingNextPage && (
                      <div className="flex items-start gap-3 p-4 bg-white border border-[#EEEEEE] rounded-[12px] shadow-sm mb-3 animate-pulse">
                        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-3/4" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="kitchen" className="pt-8 animate-in fade-in duration-300 block lg:hidden">
                <Card className="shadow-[0_2px_12px_rgba(0,0,0,0.03)] border-[#EEEEEE] overflow-hidden rounded-[12px] bg-white">
                  <CardContent className="p-0">
                    <KitchenProfile
                      kitchenName={kitchenName}
                      imageUrl={kitchen?.imageUrl ?? null}
                      avgRating={kitchenAvgRating}
                      totalReviews={kitchenTotalReviews}
                      orderCount={kitchenOrderCount}
                      kitchenSlug={kitchenSlug}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Kitchen Profile (Desktop Right) */}
          <div className="lg:col-span-1 xl:col-span-4 hidden lg:block xl:pl-6 xl:border-l border-[#EEEEEE]">
            <Card className="sticky top-24 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border-[#EEEEEE] overflow-hidden rounded-[12px] bg-white">
              <CardContent className="p-0">
                <KitchenProfile
                  kitchenName={kitchenName}
                  imageUrl={kitchen?.imageUrl ?? null}
                  avgRating={kitchenAvgRating}
                  totalReviews={kitchenTotalReviews}
                  orderCount={kitchenOrderCount}
                  kitchenSlug={kitchenSlug}
                />
              </CardContent>
            </Card>
          </div>
        </div>

      </div>

      <LocationDialog open={locationOpen} onClose={() => setLocationOpen(false)} />
      {popupItem && <AddToCartPopup item={popupItem} open={true} onOpenChange={(open) => !open && setPopupItem(null)} />}
    </div>
  );
}
