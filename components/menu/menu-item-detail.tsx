"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressiveImage } from "@/components/patterns/progressive-image";
import { useCartActions, useCartItems, useMenuDeliveryAddress } from "@/stores";
import { formatTimeSlot } from "@/lib/patterns";
import { LocationDialog } from "@/components/location";
import { getMenuItemByIdentifierClient } from "@/actions/menu-client-actions";
import { getMenuItemReviews } from "@/actions/catalog/menu-reviews";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ChevronLeft, ChevronRight, Star, MapPin,
  Share2, Minus, Plus, Heart, Leaf, Flame, Utensils,
  ShieldCheck, CheckCircle2, Truck, Timer, Info, Clock,
  Package, ShoppingCart, Users, Scale, AlertTriangle,
  ChevronRightIcon, Sparkles, Loader2, User,
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

const HIGHLIGHT_ICONS: Record<string, React.ElementType> = {
  heart: Heart,
  leaf: Leaf,
  shield: ShieldCheck,
  shieldcheck: ShieldCheck,
  package: Package,
  users: Users,
  sparkles: Sparkles,
  timer: Timer,
  truck: Truck,
  flame: Flame,
};

function highlightIcon(title: string): React.ElementType {
  const key = title.toLowerCase().replace(/[^a-z]/g, "");
  for (const [token, icon] of Object.entries(HIGHLIGHT_ICONS)) {
    if (key.includes(token)) return icon;
  }
  return Heart;
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
          className={`h-3.5 w-3.5 ${s <= rating ? "fill-orange-400 text-orange-400" : "text-slate-200"}`}
        />
      ))}
    </div>
  );
}

function MenuItemDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/30 pb-24 md:pb-10 pt-20 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-4">
            <Skeleton className="aspect-video lg:aspect-square rounded-2xl" />
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-20 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-7 flex flex-col xl:flex-row gap-6">
            <div className="flex-1 space-y-5">
              <div className="space-y-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-9 w-72" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-28 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-9 w-40" />
              <Skeleton className="h-12 w-44 rounded-lg" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                <Skeleton className="h-16 rounded-lg" />
                <Skeleton className="h-16 rounded-lg" />
                <Skeleton className="h-16 rounded-lg sm:col-span-2" />
              </div>
            </div>
            <div className="w-full xl:w-80 shrink-0">
              <Skeleton className="h-80 rounded-xl" />
            </div>
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
}

function KitchenProfile({ kitchenName, imageUrl, avgRating, totalReviews, orderCount, kitchenSlug }: KitchenProfileProps) {
  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-16 w-16 bg-green-800 text-white rounded-full flex flex-col items-center justify-center text-center shadow-inner shrink-0 relative overflow-hidden">
          {imageUrl ? (
            <Image src={imageUrl} alt={kitchenName} fill sizes="64px" className="object-cover" />
          ) : (
            <span className="text-sm font-bold">{kitchenName.slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <div>
          <h3 className="font-bold text-lg flex items-center gap-1.5">
            {kitchenName}
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </h3>
          <div className="flex items-center gap-1 mt-1 text-sm font-medium text-muted-foreground">
            {avgRating != null ? (
              <>
                <Star className="h-4 w-4 fill-green-600 text-green-600" />
                <span className="text-foreground">{avgRating.toFixed(1)}</span>
                <span>({formatCompact(totalReviews)} reviews)</span>
              </>
            ) : (
              <span>New on RRC Kitchen</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x text-center mb-6 border-y py-4">
         <div>
           <p className="font-bold text-lg">{orderCount > 0 ? `${formatCompact(orderCount)}+` : "—"}</p>
           <p className="text-xs text-muted-foreground font-medium">Orders</p>
         </div>
         <div>
           <p className="font-bold text-lg">{totalReviews > 0 ? formatCompact(totalReviews) : "—"}</p>
           <p className="text-xs text-muted-foreground font-medium">Reviews</p>
         </div>
      </div>

      <div className="space-y-1">
        {kitchenSlug && (
          <Link href={`/kitchens/${kitchenSlug}`} className="w-full flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors text-sm font-medium group">
            <span className="flex items-center gap-3"><Utensils className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" /> View Kitchen Menu</span>
            <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
          </Link>
        )}
      </div>
    </div>
  );
}

export function MenuItemDetail({ item, kitchenSlug, itemIdentifier }: MenuItemDetailProps) {
  const { data: currentItem, isPending, isFetching } = useQuery({
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

  const highlights = useMemo(
    () => (displayItem.highlights ?? []).filter((h) => h.enabled && h.title),
    [displayItem.highlights]
  );

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
      ? `${displayItem.deliveryTimeMin}${displayItem.deliveryTimeMax ? ` - ${displayItem.deliveryTimeMax}` : ""} mins`
      : "—";

  const deliveryFeeLabel =
    displayItem.freeDelivery
      ? "Free delivery"
      : displayItem.deliveryFee != null
        ? `₹${displayItem.deliveryFee} flat fee`
        : "—";

  const aboutTitle = displayItem.aboutTitle ?? `About ${displayItem.name}`;
  const aboutDescription = displayItem.aboutDescription ?? "";

  const totalReviews = displayItem.totalReviews > 0 ? displayItem.totalReviews : 0;
  const orderCount = displayItem.orderCount ?? 0;

  const kitchenAvgRating = kitchen?.avgRating ?? displayItem.avgRating;
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
    <div className="min-h-screen bg-gray-50/30 pb-24 md:pb-10 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {kitchenSlug ? (
                  <BreadcrumbLink href={`/kitchens/${kitchenSlug}`}>{kitchenName}</BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{kitchenName}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-primary font-medium">{displayItem.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Col - Images */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-video lg:aspect-square rounded-2xl overflow-hidden bg-muted group">
              {sortedPhotos.length > 0 ? (
                <ProgressiveImage
                  highResUrl={sortedPhotos[imageIndex].imageUrl}
                  alt={displayItem.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">No image</div>
              )}
              
              {displayItem.bestseller && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-[#ff4500] hover:bg-[#ff4500]/90 text-white border-none shadow-sm px-3 py-1 text-sm font-semibold rounded-md">Bestseller</Badge>
                </div>
              )}
              <div className="absolute top-4 right-4">
                <WishlistButton menuItemId={displayItem.id} size="md" className="h-10 w-10 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 border-none shadow-sm" />
              </div>

              {sortedPhotos.length > 1 && (
                <>
                  <button onClick={handlePrevImage} className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 shadow flex items-center justify-center hover:bg-white text-black transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={handleNextImage} className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 shadow flex items-center justify-center hover:bg-white text-black transition-colors">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded-md backdrop-blur-sm">
                    {imageIndex + 1} / {sortedPhotos.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {sortedPhotos.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {sortedPhotos.map((photo, idx) => (
                  <button
                    key={photo.id || idx}
                    onClick={() => setImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 transition-all ${imageIndex === idx ? 'ring-2 ring-primary ring-offset-2' : 'opacity-70 hover:opacity-100'}`}
                  >
                    <ProgressiveImage highResUrl={photo.imageUrl} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Col - Details */}
          <div className="lg:col-span-7 flex flex-col xl:flex-row gap-6">
            
            {/* Info Section */}
            <div className="flex-1 space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  {displayItem.avgRating != null && (
                    <>
                      <div className="flex items-center gap-1 bg-green-700 text-white px-2 py-0.5 rounded text-sm font-semibold">
                        <span>{displayItem.avgRating.toFixed(1)}</span>
                        <Star className="h-3 w-3 fill-current" />
                      </div>
                      <span className="text-sm text-muted-foreground underline decoration-dashed underline-offset-4 cursor-pointer hover:text-foreground transition-colors">({formatCompact(totalReviews)} reviews)</span>
                    </>
                  )}
                  {orderCount > 0 && (
                    <>
                      <span className="text-muted-foreground text-sm">|</span>
                      <span className="text-sm font-medium text-muted-foreground">{formatCompact(orderCount)} orders</span>
                    </>
                  )}
                  {isFetching && (
                    <span className="flex items-center gap-1 text-xs font-medium text-primary">
                      <Loader2 className="h-3 w-3 animate-spin" /> Updating
                    </span>
                  )}
                </div>
                <div className="flex items-start justify-between">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{displayItem.name}</h1>
                  <button onClick={handleShare} className="hidden md:flex items-center gap-2 text-primary hover:bg-primary/5 px-3 py-1.5 rounded-full border border-primary/20 transition-colors text-sm font-medium">
                    <Share2 className="h-4 w-4" /> Share
                  </button>
                </div>
              </div>

              {displayItem.description && (
                <p className="text-muted-foreground text-base leading-relaxed">
                  {displayItem.description}
                </p>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {displayItem.cuisine && (
                  <Badge variant="outline" className="bg-green-50/50 text-green-700 border-green-200 gap-1.5 py-1 px-3 text-xs font-medium rounded-full">
                    <Utensils className="h-3 w-3" /> {displayItem.cuisine}
                  </Badge>
                )}
                <Badge variant="outline" className={`gap-1.5 py-1 px-3 text-xs font-medium rounded-full ${displayItem.foodType === 'NON_VEG' || displayItem.foodType === 'NONVEG' ? 'bg-red-50/50 text-red-700 border-red-200' : 'bg-green-50/50 text-green-700 border-green-200'}`}>
                  {displayItem.foodType === 'NON_VEG' || displayItem.foodType === 'NONVEG' ? <Flame className="h-3 w-3" /> : <Leaf className="h-3 w-3" />}
                  {displayItem.foodType === 'NON_VEG' || displayItem.foodType === 'NONVEG' ? 'Non-Veg' : 'Veg'}
                </Badge>
                <Badge variant="outline" className="bg-blue-50/50 text-blue-700 border-blue-200 gap-1.5 py-1 px-3 text-xs font-medium rounded-full">
                  <Clock className="h-3 w-3" /> {formatTimeSlot(displayItem.timeSlot)}
                </Badge>
              </div>

              {/* Pricing & Add to Cart */}
              <div className="pt-4 border-t border-dashed">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-3xl font-bold tracking-tight text-[#ff4500]">₹{price}</span>
                  {hasDiscount && (
                    <>
                      <span className="text-lg text-muted-foreground line-through decoration-muted-foreground/50">₹{mrp}</span>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-bold text-xs">{discountPercent}% OFF</Badge>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-6">Inclusive of all taxes</p>

                <div className="flex items-center gap-4">
                  {cartItem ? (
                    <div className="flex items-center border border-[#ff4500] rounded-lg overflow-hidden h-12 w-32 shrink-0">
                      <button onClick={handleRemove} aria-label="Decrease quantity" className="flex-1 flex items-center justify-center text-[#ff4500] hover:bg-[#ff4500]/10 transition-colors h-full">
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-semibold text-lg w-10 text-center text-[#ff4500]">{cartItem.qty}</span>
                      <button onClick={handleAdd} aria-label="Increase quantity" className="flex-1 flex items-center justify-center text-[#ff4500] hover:bg-[#ff4500]/10 transition-colors h-full">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <Button onClick={handleAdd} disabled={!displayItem.isAvailable} className="h-12 px-8 bg-[#ff4500] hover:bg-[#ff4500]/90 text-white font-semibold text-lg rounded-lg shadow-md hover:shadow-lg transition-all min-w-[160px]">
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      {displayItem.isAvailable ? "Add to Cart" : "Currently Unavailable"}
                    </Button>
                  )}
                </div>
              </div>

              {/* Features List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6">
                {orderCount > 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                    <Users className="h-5 w-5 text-emerald-600" />
                    <div className="text-sm">
                      <span className="font-medium text-emerald-900 block">{formatCompact(orderCount)} orders</span>
                      <span className="text-emerald-700/80 text-xs">placed for this dish</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50/50 border border-orange-100">
                  <Truck className="h-5 w-5 text-orange-600" />
                  <div className="text-sm">
                    <span className="font-medium text-orange-900 block">{deliveryFeeLabel}</span>
                    <span className="text-orange-700/80 text-xs">{displayItem.freeDelivery ? "on all orders" : "calculated at checkout"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50/50 border border-blue-100 sm:col-span-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <div className="text-sm flex-1">
                    <span className="font-medium text-blue-900 block">{displayItem.packagingType || "—"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Card */}
            <div className="w-full xl:w-80 shrink-0">
              <Card className="shadow-sm border-muted/60 sticky top-24">
                <CardContent className="p-5 space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg text-green-800 mb-4 flex items-center gap-2">
                      <Truck className="h-5 w-5" /> Delivery Details
                    </h3>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Delivery Time</p>
                      <p className="text-base font-semibold">{deliveryTime}</p>
                      <p className="text-xs text-primary font-medium mt-0.5">Delivery estimate</p>
                    </div>
                  </div>
                  
                  <Separator />

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Deliver to</p>
                      <p className="text-sm text-muted-foreground truncate">{deliveryAddress || "Add delivery location"}</p>
                    </div>
                    <button onClick={() => setLocationOpen(true)} className="text-xs font-semibold text-primary hover:underline shrink-0 pt-0.5">Change</button>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-3">
                    <Truck className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Delivery Fee</p>
                      <p className="text-sm text-muted-foreground">{deliveryFeeLabel}</p>
                    </div>
                    {displayItem.freeDelivery && (
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md shrink-0">Free delivery</span>
                    )}
                  </div>

                  <Separator />

                  <div className="flex items-start gap-3">
                    <Utensils className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium mb-1">Available</p>
                      <div className="flex flex-wrap gap-2 text-xs font-medium">
                        <span className="bg-muted px-2 py-1 rounded-md">{formatTimeSlot(displayItem.timeSlot)}</span>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </div>

          </div>
        </div>

        {/* Feature Banner - Highlights */}
        {highlights.length > 0 && (
          <div className="my-10 bg-white border rounded-xl p-4 sm:p-6 shadow-sm flex flex-wrap justify-between items-center gap-6 overflow-x-auto">
            {highlights.map((h, i) => {
              const Icon = highlightIcon(h.title);
              return (
                <div key={i} className="flex items-center gap-3 min-w-[max-content]">
                  <Icon className="h-8 w-8 text-green-600 p-1.5 bg-green-50 rounded-full" />
                  <div>
                    <p className="font-semibold text-sm">{h.title}</p>
                    <p className="text-xs text-muted-foreground">{h.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Tabs Section */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b rounded-none flex-nowrap overflow-x-auto scrollbar-hide">
                <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3 font-medium flex items-center gap-2 text-muted-foreground data-[state=active]:text-foreground">
                  <Info className="h-4 w-4" /> Overview
                </TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3 font-medium flex items-center gap-2 text-muted-foreground data-[state=active]:text-foreground">
                  <Star className="h-4 w-4" /> Reviews ({formatCompact(totalReviews)})
                </TabsTrigger>
                <TabsTrigger value="kitchen" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3 font-medium flex items-center gap-2 text-muted-foreground data-[state=active]:text-foreground lg:hidden">
                  <Package className="h-4 w-4" /> Kitchen Info
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="pt-6 space-y-8 animate-in fade-in duration-300">
                {/* About this dish */}
                {aboutTitle && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">{aboutTitle}</h3>
                    {aboutDescription && (
                      <p className="text-muted-foreground leading-relaxed">{aboutDescription}</p>
                    )}
                  </div>
                )}
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white border rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 shadow-sm">
                    <Users className="h-6 w-6 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Serves</p>
                      <p className="font-semibold text-sm">{displayItem.serves != null ? `${displayItem.serves} Person${displayItem.serves > 1 ? "s" : ""}` : "—"}</p>
                    </div>
                  </div>
                  <div className="bg-white border rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 shadow-sm">
                    <Scale className="h-6 w-6 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Portion Size</p>
                      <p className="font-semibold text-sm">{displayItem.portionSize || "—"}</p>
                    </div>
                  </div>
                  <div className="bg-white border rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 shadow-sm">
                    <Timer className="h-6 w-6 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Shelf Life</p>
                      <p className="font-semibold text-sm">{displayItem.shelfLife || "—"}</p>
                    </div>
                  </div>
                  <div className="bg-white border rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 shadow-sm">
                    <AlertTriangle className="h-6 w-6 text-[#ff4500]" />
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Allergens</p>
                      <p className="font-semibold text-sm text-[#ff4500]">{displayItem.allergens || "—"}</p>
                    </div>
                  </div>
                </div>

                {/* You may also like */}
                {(displayItem.relatedItems ?? []).length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">You may also like</h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                      {displayItem.relatedItems!.map((sim) => (
                        <Card key={sim.id} className="min-w-[160px] max-w-[160px] flex-shrink-0 cursor-pointer hover:shadow-md transition-shadow overflow-hidden group">
                          <div className="relative h-28 bg-muted w-full">
                            {sim.imageUrl && <ProgressiveImage highResUrl={sim.imageUrl} alt={sim.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />}
                          </div>
                          <CardContent className="p-3">
                            <h4 className="font-semibold text-sm mb-1 truncate">{sim.name}</h4>
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-sm">₹{sim.price}</span>
                              {sim.avgRating != null && (
                                <div className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                                  <span>{sim.avgRating.toFixed(1)}</span>
                                  <Star className="h-3 w-3 fill-current" />
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="kitchen" className="pt-6 animate-in fade-in duration-300">
                <Card className="shadow-sm border-muted/60 overflow-hidden">
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
              <TabsContent value="reviews" className="pt-6 animate-in fade-in duration-300">
                {reviewsQuery.isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex gap-3 p-4 bg-white border rounded-xl shadow-sm animate-pulse">
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
                    <Star className="h-10 w-10 text-slate-300" />
                    <p className="font-semibold text-slate-900">No reviews yet</p>
                    <p className="text-sm text-muted-foreground max-w-xs">Be the first to review this dish after your order.</p>
                  </div>
                ) : (
                  <div ref={reviewsScrollRef} className="relative max-h-[640px] overflow-y-auto pr-1 custom-scrollbar">
                    <div className="relative" style={{ height: reviewVirtualizer.getTotalSize() }}>
                      {reviewVirtualizer.getVirtualItems().map((virtualRow) => {
                        const review = allReviews[virtualRow.index];
                        return (
                          <div
                            key={review.id}
                            className="absolute left-0 right-0"
                            style={{ transform: `translateY(${virtualRow.start}px)` }}
                          >
                            <div className="flex items-start gap-3 p-4 bg-white border rounded-xl shadow-sm mb-3">
                              <div className="h-10 w-10 rounded-full bg-green-800 text-white flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden relative">
                                {review.user.image ? (
                                  <Image src={review.user.image} alt={review.user.name ?? "Reviewer"} fill sizes="40px" className="object-cover" />
                                ) : review.user.name ? (
                                  <span>{review.user.name.slice(0, 2).toUpperCase()}</span>
                                ) : (
                                  <User className="h-4 w-4" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  {review.user.name && <p className="font-semibold text-sm truncate">{review.user.name}</p>}
                                  <span className="text-xs text-muted-foreground">{formatReviewDate(review.createdAt)}</span>
                                </div>
                                <div className="mt-1">
                                  <ReviewStars rating={review.rating} />
                                </div>
                                {review.comment && (
                                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{review.comment}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div ref={reviewsSentinelRef} className="h-1" />
                    {reviewsQuery.isFetchingNextPage && (
                      <div className="flex items-start gap-3 p-4 bg-white border rounded-xl shadow-sm mb-3 animate-pulse">
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
            </Tabs>
          </div>

          {/* Kitchen Profile (Desktop Right) */}
          <div className="lg:col-span-1 hidden lg:block">
            <Card className="sticky top-24 shadow-sm border-muted/60 overflow-hidden">
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
