"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCartActions, useCartItems, useKitchenDetail, useKitchenDetailActions } from "@/stores";
import Image from "next/image";
import {
  Search, Star, Check, ShieldCheck, Clock, Leaf, Package, Heart,
  Users, ShoppingBag, Calendar, ChevronDown, CheckCircle2,
  ThumbsUp, Coffee, UtensilsCrossed, Utensils, Box, Sandwich,
  Truck, type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AddToCartPopup, type AddPopupItem } from "@/components/menu/add-to-cart-popup";
import { CompoundMenuCard, VegIcon, NonVegIcon } from "@/components/patterns/compound-menu-card";
import { getKitchenStatus, type KitchenStatus, type OperatingHours } from "@/components/kitchen/kitchen-timing-display";
import { AboutKitchenTab } from "@/components/kitchen/about-kitchen-tab";
import { ReviewsKitchenTab } from "@/components/kitchen/reviews-kitchen-tab";
import { InfoKitchenTab } from "@/components/kitchen/info-kitchen-tab";
import { getKitchenDetailLive } from "@/actions/catalog/kitchen-detail";
import { useAblyKitchenChannel } from "@/hooks/useAblySubscribe";

interface KitchenItem {
  id: string;
  slug?: string;
  shortId: string;
  kitchenSlug: string;
  name: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  foodType: string;
  timeSlot: string;
  imageUrl: string | null;
  photos: { imageUrl: string; sortOrder: number }[];
  kitchenName: string;
  orderCount?: number;
  isBestseller?: boolean;
  calories?: string;
  contains?: string;
}

export interface KitchenDetail {
  id: string;
  slug: string;
  displayName: string;
  avgRating: number | null;
  totalReviews: number;
  imageUrl: string | null;
  cuisineTags: string[];
  items: KitchenItem[];
  operatingHours: OperatingHours | null;
  estimatedPrepTime: number | null;
  costForTwo?: string;
  totalOrdersDelivered?: number;
  hasPureVeg?: boolean;
  timeOnPlatform?: string;
  kitchenCreatedAt?: string;
  description?: string | null;
  address?: {
    lineOne: string;
    doorNo?: string | null;
    area?: string | null;
    landmark?: string | null;
    pincode: string;
    latitude: number;
    longitude: number;
  } | null;
}

interface Props {
  kitchen: KitchenDetail;
  initialTimeSlot: string | null;
  initialSearchQuery?: string | null;
}

import type { MenuCardItem } from "@/components/patterns/compound-menu-card";

type MenuCategory = { id: string; label: string; icon: LucideIcon };

const TIME_SLOT_CONFIG: Record<string, { label: string; icon: LucideIcon }> = {
  MORNING: { label: "Breakfast", icon: Coffee },
  LUNCH: { label: "Lunch", icon: UtensilsCrossed },
  DINNER: { label: "Dinner", icon: Utensils },
  EVENINGSNACKS: { label: "Snacks", icon: Sandwich },
};

function getTimingDisplayInfo(hours: OperatingHours | null) {
  if (!hours || Object.keys(hours).length === 0) {
    return { timeRange: "—", dayRange: "Timings not listed" };
  }
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const firstDay = days.find(d => hours[d]);
  const openTime = firstDay && hours[firstDay] ? hours[firstDay].open : "—";
  const closeTime = firstDay && hours[firstDay] ? hours[firstDay].close : "—";

  const activeDays = days.filter(d => hours[d]);
  let dayRange = "Mon – Sun (All Days)";
  if (activeDays.length < 7 && activeDays.length > 0) {
    const shortNames: Record<string, string> = {
      monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
      friday: "Fri", saturday: "Sat", sunday: "Sun",
    };
    dayRange = activeDays.map(d => shortNames[d]).join(", ");
  }

  return { timeRange: `${openTime} – ${closeTime}`, dayRange };
}

function formatCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k+`;
  if (count > 0) return `${count}+`;
  return "0";
}

export function KitchenDetailClient({ kitchen: initialKitchen, initialSearchQuery }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const storeKitchen = useKitchenDetail();
  const { hydrate } = useKitchenDetailActions();

  // Real-time kitchen detail: SSR data is seeded as initialData, then kept fresh
  // via 30s polling + Ably kitchen channel events (kitchen:status_change, kitchen:new_order...)
  const { data: liveKitchen } = useQuery<KitchenDetail | null>({
    queryKey: ["kitchen-detail", initialKitchen.slug],
    queryFn: () => getKitchenDetailLive(initialKitchen.slug),
    initialData: initialKitchen,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  // Hydrate the Zustand store from SSR props (per kitchen slug)
  useEffect(() => {
    hydrate(initialKitchen);
  }, [initialKitchen, hydrate]);

  // Keep the store in sync with the latest live data
  useEffect(() => {
    if (liveKitchen) hydrate(liveKitchen);
  }, [liveKitchen, hydrate]);

  // Ably real-time: any kitchen event (status change, new order, stock low...) triggers a refetch
  useAblyKitchenChannel(initialKitchen.id, () => {
    queryClient.invalidateQueries({ queryKey: ["kitchen-detail", initialKitchen.slug] });
  });

  const kitchen = storeKitchen ?? initialKitchen;

  const { addToCart } = useCartActions();
  const cartItems = useCartItems();
  const [activeTab, setActiveTab] = useState<"menu" | "about" | "reviews" | "info">("menu");
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery ?? "");
  const [activeCategory, setActiveCategory] = useState<string>("Recommended");
  const [popupItem, setPopupItem] = useState<AddPopupItem | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [foodFilter, setFoodFilter] = useState<"ALL" | "VEG" | "NONVEG">("ALL");
  const [bestsellerOnly, setBestsellerOnly] = useState(false);
  const [status, setStatus] = useState<KitchenStatus>(() => getKitchenStatus(kitchen.operatingHours ?? null));

  // Re-evaluate open/closed status immediately and every minute so the badge stays live
  useEffect(() => {
    const computeStatus = () => setStatus(getKitchenStatus(kitchen.operatingHours ?? null));
    computeStatus();
    const timer = window.setInterval(computeStatus, 60_000);
    return () => window.clearInterval(timer);
  }, [kitchen.operatingHours]);

  const menuCategories = useMemo(() => {
    const categories = [{ id: "Recommended", label: "Recommended", icon: ThumbsUp }];
    const uniqueTimeSlots = Array.from(new Set(kitchen.items.map(i => i.timeSlot))).sort();

    for (const slot of uniqueTimeSlots) {
      if (slot && TIME_SLOT_CONFIG[slot]) {
        categories.push({ id: slot, label: TIME_SLOT_CONFIG[slot].label, icon: TIME_SLOT_CONFIG[slot].icon });
      } else if (slot) {
        categories.push({ id: slot, label: slot, icon: Box });
      }
    }
    return categories;
  }, [kitchen.items]);

  const hasBestseller = useMemo(() => kitchen.items.some(i => i.isBestseller), [kitchen.items]);

  const timingInfo = useMemo(() => getTimingDisplayInfo(kitchen.operatingHours), [kitchen.operatingHours]);

  const totalOrders = kitchen.totalOrdersDelivered ?? kitchen.items.reduce((sum, i) => sum + (i.orderCount ?? 0), 0);
  const deliveryTimeRange = kitchen.estimatedPrepTime
    ? `${kitchen.estimatedPrepTime - 5}–${kitchen.estimatedPrepTime} mins`
    : "—";
  const isPureVeg = kitchen.hasPureVeg ?? kitchen.items.every(i => i.foodType === "VEG");
  const platformTime = kitchen.timeOnPlatform ?? "—";

  const displayRating = kitchen.avgRating;

  const timeSlotCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of kitchen.items) {
      const slotKey = item.timeSlot;
      const slotLabel = TIME_SLOT_CONFIG[slotKey]?.label ?? slotKey;
      counts[slotLabel] = (counts[slotLabel] || 0) + 1;
    }
    return counts;
  }, [kitchen.items]);

  const handleShowAddPopup = useCallback(
    (menuItem: KitchenItem | MenuCardItem) => {
      const existing = cartItems.find(ci => ci.id === menuItem.id);
      if (!existing) {
        addToCart({
          id: menuItem.id,
          name: menuItem.name,
          price: Number(menuItem.price),
          qty: 1,
          foodType: menuItem.foodType,
          timeSlot: menuItem.timeSlot,
          kitchenName: menuItem.kitchenName,
        });
      }
      setPopupItem({
        id: menuItem.id,
        name: menuItem.name,
        price: Number(menuItem.price),
        compareAtPrice: menuItem.compareAtPrice ?? null,
        foodType: menuItem.foodType,
        imageUrl: menuItem.imageUrl ?? null,
        kitchenName: menuItem.kitchenName,
        timeSlot: menuItem.timeSlot,
      });
      setPopupOpen(true);
    },
    [cartItems, addToCart]
  );

  const handleItemClick = useCallback(
    (item: KitchenItem | MenuCardItem) => {
      const slug = item.slug ?? item.name.toLowerCase().replace(/\s+/g, "-");
      const shortId = item.shortId ?? item.id.split("-").pop() ?? item.id;
      const kitchenSlug = item.kitchenSlug ?? kitchen.slug;
      router.push(`/menu/${kitchenSlug}/${slug}-${shortId}`);
    },
    [kitchen.slug, router]
  );

  const filteredItems = useMemo(() => {
    let items = [...kitchen.items];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q) || (i.description && i.description.toLowerCase().includes(q)));
    }

    if (foodFilter !== "ALL") {
      items = items.filter(i => i.foodType === foodFilter);
    }

    if (bestsellerOnly) {
      items = items.filter(i => i.isBestseller);
    }

    if (activeCategory === "Recommended") {
      return items
        .sort((a, b) => (b.orderCount ?? 0) - (a.orderCount ?? 0))
        .slice(0, 10);
    }
    return items.filter(i => i.timeSlot === activeCategory);
  }, [kitchen.items, activeCategory, searchQuery, foodFilter, bestsellerOnly]);

  const searchFilterOptions = useMemo(() => {
    if (!searchQuery) return { mealTypes: [], dietPrefs: [], cuisines: [] };
    
    const mealTypesSet = new Set<string>();
    const dietPrefsSet = new Set<string>();
    
    kitchen.items.forEach(i => {
      if (i.timeSlot && TIME_SLOT_CONFIG[i.timeSlot]) {
        mealTypesSet.add(TIME_SLOT_CONFIG[i.timeSlot].label);
      } else if (i.timeSlot) {
        mealTypesSet.add(i.timeSlot);
      }
      
      if (i.foodType === "VEG") dietPrefsSet.add("Pure Veg");
      else if (i.foodType === "NONVEG") dietPrefsSet.add("Non Veg");
      else if (i.foodType) dietPrefsSet.add(i.foodType);
    });

    return {
      mealTypes: Array.from(mealTypesSet),
      dietPrefs: Array.from(dietPrefsSet),
      cuisines: kitchen.cuisineTags || []
    };
  }, [searchQuery, kitchen.items, kitchen.cuisineTags]);

  return (
    <main className="min-h-screen bg-muted text-foreground pb-20 lg:pb-20" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>

      <div className="hidden md:block bg-white border-b border-border">
        <div className="max-w-[1200px] mx-auto px-6 py-3">
          <div className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5">
            <span className="hover:text-primary cursor-pointer transition-colors">Home</span>
            <span className="text-gray-300">›</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Kitchens</span>
            <span className="text-gray-300">›</span>
            <span className="text-gray-800 font-semibold">{kitchen.displayName}</span>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-border">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex flex-row lg:flex-row gap-4 md:gap-6">

            <div className="relative w-[140px] md:w-[340px] h-[160px] md:h-[220px] shrink-0 rounded-xl overflow-visible">
              {kitchen.imageUrl ? (
                <Image src={kitchen.imageUrl} alt={kitchen.displayName} fill className="object-cover rounded-xl" priority />
              ) : (
                <div className="w-full h-full bg-orange-50 rounded-xl flex items-center justify-center">
                  <UtensilsCrossed className="w-10 md:w-12 h-10 md:h-12 text-orange-200" />
                </div>
              )}

              {hasBestseller && (
                <div className="absolute top-2 md:top-3 left-2 md:left-3 bg-primary text-white text-[9px] md:text-[11px] font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-md shadow-sm">
                  Bestseller
                </div>
              )}

              <div className="absolute -bottom-4 md:-bottom-5 left-2 md:left-4 w-[56px] md:w-[80px] h-[56px] md:h-[80px] rounded-full border-[3px] border-white bg-muted overflow-hidden shadow-lg">
                {kitchen.imageUrl ? (
                  <Image src={kitchen.imageUrl} alt="Chef" fill className="object-cover" />
                ) : null}
              </div>

              {isPureVeg && (
                <div className="absolute -bottom-2 md:-bottom-3 left-14 md:left-20 bg-white border border-border text-green-700 text-[8px] md:text-[9px] font-bold px-1.5 md:px-2 py-0.5 rounded shadow-sm flex gap-1 items-center z-10">
                  <VegIcon className="w-2 md:w-2.5 h-2 md:h-2.5" /> PURE VEG
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-start min-w-0">
              <div className="flex items-center gap-1.5 md:gap-2.5">
                <h1 className="text-[18px] md:text-[26px] font-extrabold text-gray-900 leading-tight tracking-tight truncate">{kitchen.displayName}</h1>
                <div className="bg-green-600 text-white rounded-full w-[18px] md:w-[22px] h-[18px] md:h-[22px] flex items-center justify-center shrink-0">
                  <Check className="w-2.5 md:w-3.5 h-2.5 md:h-3.5 stroke-[3]" />
                </div>
              </div>

              <div className="flex items-center flex-wrap gap-1.5 md:gap-3 mt-1.5 md:mt-2.5 text-[11px] md:text-[13px] text-gray-600">
                <div className="flex items-center gap-0.5 md:gap-1 text-primary font-bold">
                  <Star className="w-3 md:w-4 h-3 md:h-4 fill-primary text-primary" />
                  <span>{displayRating ? `${displayRating.toFixed(1)} (${formatCount(kitchen.totalReviews)} ratings)` : `New (${formatCount(kitchen.totalReviews)} ratings)`}</span>
                </div>
                <span className="text-gray-300 hidden sm:inline">|</span>
                <div className="flex items-center gap-0.5 md:gap-1 text-muted-foreground">
                  <Clock className="w-3 md:w-3.5 h-3 md:h-3.5 text-muted-foreground" />
                  <span>{deliveryTimeRange}</span>
                </div>
              </div>

              <div className="text-[11px] md:text-[13px] text-muted-foreground mt-1 md:mt-2 font-medium">
                {kitchen.cuisineTags.join(", ")}
              </div>

              {kitchen.description ? (
                <p className="text-[11px] md:text-[13px] text-muted-foreground mt-2 md:mt-3 leading-relaxed max-w-2xl line-clamp-3 md:line-clamp-none">
                  {kitchen.description}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-1.5 md:gap-2 mt-2.5 md:mt-4">
                <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-border text-gray-700 text-[10px] md:text-[11px] font-semibold bg-white">
                  <ShieldCheck className="w-3 md:w-3.5 h-3 md:h-3.5 text-green-600" /> Hygienic Kitchen
                </div>
                <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-border text-gray-700 text-[10px] md:text-[11px] font-semibold bg-white">
                  <Clock className="w-3 md:w-3.5 h-3 md:h-3.5 text-primary" /> On-time Delivery
                </div>
                <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-border text-gray-700 text-[10px] md:text-[11px] font-semibold bg-white">
                  <Leaf className="w-3 md:w-3.5 h-3 md:h-3.5 text-green-600" /> Fresh Ingredients
                </div>
                <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-border text-gray-700 text-[10px] md:text-[11px] font-semibold bg-white">
                  <Package className="w-3 md:w-3.5 h-3 md:h-3.5 text-primary" /> Safe & Secure Packaging
                </div>
              </div>

          
            </div>

            <div className="hidden xl:flex flex-col w-[260px] shrink-0">
              <button className="w-full h-11 rounded-lg border border-border bg-white hover:bg-muted/50 text-gray-700 font-semibold text-[13px] flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer">
                <Heart className="w-4 h-4 text-muted-foreground" /> Follow Kitchen
              </button>

              <div className="mt-4 bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border">
                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-[15px] font-extrabold text-gray-900">{formatCount(kitchen.totalReviews)}</div>
                    <div className="text-[11px] text-muted-foreground font-medium">Total Reviews</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border">
                  <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                    <Star className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-[15px] font-extrabold text-gray-900">{displayRating ? displayRating.toFixed(1) : "New"}</div>
                    <div className="text-[11px] text-muted-foreground font-medium">Average Rating</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border">
                  <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-[15px] font-extrabold text-gray-900">{formatCount(totalOrders)}</div>
                    <div className="text-[11px] text-muted-foreground font-medium">Orders Delivered</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-3.5">
                  <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-[15px] font-extrabold text-gray-900">{platformTime}</div>
                    <div className="text-[11px] text-muted-foreground font-medium">On RRC Kitchen</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="xl:hidden bg-white border-b border-border overflow-x-auto px-4 md:px-6 py-3" style={{ scrollbarWidth: 'none' }}>
        <div className="flex items-stretch gap-0 justify-between min-w-[460px]">
          <div className="flex flex-col items-center gap-1.5 px-3">
            <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center bg-white">
              <Heart className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">Follow Kitchen</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 px-3">
            <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center bg-white">
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-center">
              <div className="text-[12px] font-extrabold text-gray-900">{formatCount(kitchen.totalReviews)}</div>
              <div className="text-[9px] text-muted-foreground font-medium">Total Reviews</div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1.5 px-3">
            <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center bg-white">
              <Star className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-center">
              <div className="text-[12px] font-extrabold text-gray-900 flex items-center gap-0.5 justify-center">{displayRating ? displayRating.toFixed(1) : "New"} <Star className="w-2.5 h-2.5 fill-primary text-primary" /></div>
              <div className="text-[9px] text-muted-foreground font-medium">Average Rating</div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1.5 px-3">
            <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center bg-white">
              <ShoppingBag className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-center">
              <div className="text-[12px] font-extrabold text-gray-900">{formatCount(totalOrders)}</div>
              <div className="text-[9px] text-muted-foreground font-medium">Orders Delivered</div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1.5 px-3">
            <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center bg-white">
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-center">
              <div className="text-[12px] font-extrabold text-gray-900">{platformTime}</div>
              <div className="text-[9px] text-muted-foreground font-medium">On RRC Kitchen</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-border sticky top-0 z-30">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="flex items-center overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setActiveTab("menu")}
              className={cn("px-4 md:px-8 py-3 md:py-4 font-semibold text-[12px] md:text-[14px] whitespace-nowrap border-b-[3px] transition-colors flex items-center gap-1.5 md:gap-2",
                activeTab === "menu" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-gray-800"
              )}
            >
              <UtensilsCrossed className="w-3.5 md:w-4 h-3.5 md:h-4" /> Menu
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={cn("px-4 md:px-8 py-3 md:py-4 font-semibold text-[12px] md:text-[14px] whitespace-nowrap border-b-[3px] transition-colors flex items-center gap-1.5 md:gap-2",
                activeTab === "about" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-gray-800"
              )}
            >
              <Users className="w-3.5 md:w-4 h-3.5 md:h-4" /> About Kitchen
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={cn("px-4 md:px-8 py-3 md:py-4 font-semibold text-[12px] md:text-[14px] whitespace-nowrap border-b-[3px] transition-colors flex items-center gap-1.5 md:gap-2",
                activeTab === "reviews" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-gray-800"
              )}
            >
              <Star className="w-3.5 md:w-4 h-3.5 md:h-4" /> Reviews ({kitchen.totalReviews})
            </button>
            <button
              onClick={() => setActiveTab("info")}
              className={cn("px-4 md:px-8 py-3 md:py-4 font-semibold text-[12px] md:text-[14px] whitespace-nowrap border-b-[3px] transition-colors flex items-center gap-1.5 md:gap-2",
                activeTab === "info" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-gray-800"
              )}
            >
              <CheckCircle2 className="w-3.5 md:w-4 h-3.5 md:h-4" /> Kitchen Information
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-4 md:py-6">
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">

          {activeTab === "menu" && !searchQuery && (
            <div className="w-full lg:w-[200px] shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden lg:sticky lg:top-[65px]">
                <h3 className="font-bold text-[13px] md:text-[14px] text-gray-900 px-3 md:px-4 py-2.5 md:py-3.5 border-b border-border">Menu Categories</h3>
                <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible py-1" style={{ scrollbarWidth: 'none' }}>
                  {menuCategories.map((cat: MenuCategory) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={cn(
                        "flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 transition-all text-left text-[12px] md:text-[13px] whitespace-nowrap shrink-0",
                        activeCategory === cat.id
                          ? "bg-[#FFF3E8] text-primary font-bold lg:border-l-[3px] lg:border-primary"
                          : "text-gray-600 font-medium hover:bg-muted/50 lg:border-l-[3px] lg:border-transparent"
                      )}
                    >
                      <cat.icon className={cn("w-3.5 md:w-4 h-3.5 md:h-4 shrink-0", activeCategory === cat.id ? "text-primary" : "text-muted-foreground")} />
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "menu" && searchQuery && (
            <div className="w-full lg:w-[240px] shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden lg:sticky lg:top-[65px] p-4 md:p-5">
                <div className="flex items-center justify-between mb-5 border-b border-border pb-3">
                  <h3 className="font-extrabold text-[15px] text-gray-900">Filters</h3>
                  <button className="text-[11px] font-bold text-primary" onClick={() => setSearchQuery("")}>Clear All</button>
                </div>
                
                {/* Meal Type */}
                {searchFilterOptions.mealTypes.length > 0 && (
                  <div className="mb-5">
                    <h4 className="font-bold text-[13px] text-gray-900 flex items-center justify-between mb-3">
                      Meal Type <ChevronDown className="h-3.5 w-3.5" />
                    </h4>
                    <div className="space-y-2.5">
                      {searchFilterOptions.mealTypes.map((type, idx) => (
                        <label key={type} className="flex items-center gap-2.5 cursor-pointer">
                          <input type="checkbox" className="w-3.5 h-3.5 rounded-sm border-gray-300 text-primary focus:ring-primary" defaultChecked={idx === 0} />
                          <span className="text-[12px] font-semibold text-gray-600">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cuisine */}
                {searchFilterOptions.cuisines.length > 0 && (
                  <div className="mb-5">
                    <h4 className="font-bold text-[13px] text-gray-900 flex items-center justify-between mb-3">
                      Cuisine <ChevronDown className="h-3.5 w-3.5" />
                    </h4>
                    <div className="space-y-2.5">
                      {searchFilterOptions.cuisines.map((type, idx) => (
                        <label key={type} className="flex items-center gap-2.5 cursor-pointer">
                          <input type="checkbox" className="w-3.5 h-3.5 rounded-sm border-gray-300 text-primary focus:ring-primary" defaultChecked={idx === 0} />
                          <span className="text-[12px] font-semibold text-gray-600">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Diet Preference */}
                {searchFilterOptions.dietPrefs.length > 0 && (
                  <div>
                    <h4 className="font-bold text-[13px] text-gray-900 flex items-center justify-between mb-3">
                      Diet Preference <ChevronDown className="h-3.5 w-3.5" />
                    </h4>
                    <div className="space-y-2.5">
                      {searchFilterOptions.dietPrefs.map((type, idx) => (
                        <label key={type} className="flex items-center gap-2.5 cursor-pointer">
                          <input type="checkbox" className="w-3.5 h-3.5 rounded-sm border-gray-300 text-primary focus:ring-primary" defaultChecked={idx === 0} />
                          <span className="text-[12px] font-semibold text-gray-600">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            {activeTab === "menu" ? (
              <>
                {!searchQuery ? (
                  <>
                    <div className="relative mb-4 md:mb-5">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search for dishes"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-white text-[13px] md:text-[14px] text-gray-900 font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm"
                      />
                    </div>

                    <div className="flex items-center gap-2 mb-4 md:mb-5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                      <button
                        onClick={() => { setFoodFilter("ALL"); setBestsellerOnly(false); }}
                        className={cn("px-4 py-2 rounded-lg text-[12px] font-bold whitespace-nowrap transition-colors border",
                          foodFilter === "ALL" && !bestsellerOnly
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-gray-700 border-border hover:bg-muted/50"
                        )}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setFoodFilter(foodFilter === "VEG" ? "ALL" : "VEG")}
                        className={cn("px-4 py-2 rounded-lg text-[12px] font-bold whitespace-nowrap transition-colors border flex items-center gap-1.5",
                          foodFilter === "VEG"
                            ? "bg-green-600 text-white border-green-600"
                            : "bg-white text-gray-700 border-border hover:bg-muted/50"
                        )}
                      >
                        <VegIcon className="w-3.5 h-3.5" /> Veg
                      </button>
                      <button
                        onClick={() => setFoodFilter(foodFilter === "NONVEG" ? "ALL" : "NONVEG")}
                        className={cn("px-4 py-2 rounded-lg text-[12px] font-bold whitespace-nowrap transition-colors border flex items-center gap-1.5",
                          foodFilter === "NONVEG"
                            ? "bg-red-600 text-white border-red-600"
                            : "bg-white text-gray-700 border-border hover:bg-muted/50"
                        )}
                      >
                        <NonVegIcon className="w-3.5 h-3.5" /> Non Veg
                      </button>
                      {hasBestseller && (
                        <button
                          onClick={() => setBestsellerOnly(!bestsellerOnly)}
                          className={cn("px-4 py-2 rounded-lg text-[12px] font-bold whitespace-nowrap transition-colors border",
                            bestsellerOnly
                              ? "bg-primary text-white border-primary"
                              : "bg-white text-gray-700 border-border hover:bg-muted/50"
                          )}
                        >
                          Bestseller
                        </button>
                      )}
                      <div className="ml-auto flex items-center gap-1.5 text-[11px] md:text-[12px] text-muted-foreground bg-white px-2.5 md:px-3.5 py-1.5 md:py-2 rounded-lg border border-border shadow-sm cursor-pointer hover:bg-muted/50 transition-colors">
                        Sort by: <span className="text-gray-900 font-semibold ml-0.5">Popularity</span> <ChevronDown className="w-3 md:w-3.5 h-3 md:h-3.5 ml-0.5 text-muted-foreground" />
                      </div>
                    </div>

                    {activeCategory !== "Recommended" && (() => {
                      const catLabel = menuCategories.find((c: MenuCategory) => c.id === activeCategory)?.label;
                      const count = timeSlotCounts[catLabel ?? ""] ?? 0;
                      return (
                        <h2 className="text-[15px] md:text-[18px] font-bold text-gray-900 mb-4">
                          {catLabel} ({count})
                        </h2>
                      );
                    })()}

                    {activeCategory === "Recommended" && (
                      <h2 className="text-[15px] md:text-[18px] font-bold text-gray-900 mb-4">
                        Recommended for You
                      </h2>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 md:mb-5 gap-3">
                      <div>
                        <h2 className="text-[18px] md:text-[22px] font-extrabold text-[#0A3D24]">
                          Menu for <span className="text-green-700">&quot;{searchQuery}&quot;</span>
                        </h2>
                        <p className="text-[12px] md:text-[13px] font-bold text-gray-700 mt-1">
                          Showing {filteredItems.length} results for {searchQuery}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] md:text-[12px] text-muted-foreground bg-white px-3 py-1.5 rounded-lg border border-border shadow-sm cursor-pointer hover:bg-muted/50 transition-colors shrink-0 self-start md:self-auto">
                        Sort by: <span className="text-gray-900 font-semibold ml-0.5">Popularity</span> <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 mb-5 md:mb-6 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                      <button className="px-3.5 py-1.5 rounded-full text-[11px] md:text-[12px] font-bold whitespace-nowrap transition-colors border bg-[#FFF3E8] text-primary border-primary">
                        All ({filteredItems.length})
                      </button>
                      
                      {/* Dynamic pills based on filtered items (just taking the first few for the mockup look) */}
                      {Array.from(new Set(filteredItems.map(i => i.name.split(" ")[0] + " " + (i.name.split(" ")[1] || ""))))
                        .slice(0, 5)
                        .map((name, idx) => (
                          <button key={idx} className="px-3.5 py-1.5 rounded-full text-[11px] md:text-[12px] font-bold whitespace-nowrap transition-colors border bg-white text-gray-700 border-border hover:bg-muted/50 shadow-sm">
                            {name.trim()} ({filteredItems.filter(i => i.name.includes(name.trim())).length})
                          </button>
                      ))}
                    </div>
                  </>
                )}

                {filteredItems.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 md:p-12 text-center border border-border shadow-sm flex flex-col items-center">
                    <Search className="w-10 md:w-12 h-10 md:h-12 text-gray-300 mb-3 md:mb-4" />
                    <h3 className="text-base md:text-lg font-bold text-gray-900">No dishes found</h3>
                    <p className="text-muted-foreground mt-1.5 md:mt-2 text-sm font-medium">Try selecting a different category or adjusting filters.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 md:gap-4">
                    {filteredItems.map((item) => (
                      <CompoundMenuCard.Root
                        key={item.id}
                        item={{
                          ...item,
                          kitchenRating: kitchen.avgRating,
                        }}
                        onShowAddPopup={handleShowAddPopup}
                        onItemClick={handleItemClick}
                      >
                        <CompoundMenuCard.ImageSection />
                        <CompoundMenuCard.Header />
                      </CompoundMenuCard.Root>
                    ))}
                  </div>
                )}

                {filteredItems.length > 0 && (
                  <button className="w-full mt-4 md:mt-6 h-10 md:h-11 rounded-xl border border-primary text-primary hover:bg-[#FFF7F0] font-bold text-[12px] md:text-[13px] uppercase tracking-wider bg-white transition-colors cursor-pointer shadow-sm">
                    VIEW FULL MENU
                  </button>
                )}
              </>
            ) : activeTab === "about" ? (
              <AboutKitchenTab kitchen={kitchen} />
            ) : activeTab === "reviews" ? (
              <ReviewsKitchenTab kitchen={kitchen} />
            ) : activeTab === "info" ? (
              <InfoKitchenTab kitchen={kitchen} />
            ) : (
              <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-border flex items-center justify-center min-h-[300px] md:min-h-[400px]">
                <p className="text-muted-foreground font-medium">This section is currently being updated.</p>
              </div>
            )}
          </div>

          {activeTab === "menu" && (
            <div className="hidden lg:flex w-[280px] shrink-0 flex-col gap-5">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
                  <Clock className="w-4 h-4 text-gray-700" />
                  <h3 className="font-bold text-[14px] text-gray-900">Kitchen Timings</h3>
                </div>
                <div className="px-5 py-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", status.isOpen ? "bg-green-500" : "bg-red-500")} />
                    <span className={cn("text-[13px] font-bold", status.isOpen ? "text-green-600" : "text-red-600")}>
                      {status.isOpen ? "Open Today" : "Closed"}
                    </span>
                  </div>
                  <div className="text-[14px] font-bold text-gray-900">{timingInfo.timeRange}</div>
                  <div className="text-[12px] text-muted-foreground">{timingInfo.dayRange}</div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
                  <Truck className="w-4 h-4 text-gray-700" />
                  <h3 className="font-bold text-[14px] text-gray-900">Delivery Information</h3>
                </div>
                <div className="px-5 py-4 space-y-3">
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-muted-foreground">Delivery Time</span>
                    <span className="font-semibold text-gray-900">{deliveryTimeRange}</span>
                  </div>
                </div>
                <div className="mx-5 mb-4 bg-[#FFF7F0] rounded-lg p-2.5 text-[11px] font-medium text-muted-foreground text-center border border-orange-100">
                  Track your order in real-time once it&apos;s confirmed.
                </div>
              </div>

              <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="px-5 py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-[14px] text-gray-900 leading-tight">
                        We follow highest<br />
                        <span className="text-green-700">hygiene</span> standards
                      </h3>
                    </div>
                    <div className="relative shrink-0 ml-3">
                      <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center border border-green-100">
                        <ShieldCheck className="w-7 h-7 text-green-600" />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-green-600 rounded-full border-2 border-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
                      <span className="text-[12px] text-gray-600">Regular kitchen sanitization</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
                      <span className="text-[12px] text-gray-600">Fresh ingredients daily</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
                      <span className="text-[12px] text-gray-600">Safe & hygienic packaging</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
                      <span className="text-[12px] text-gray-600">Trained & verified home chefs</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="lg:hidden px-4 md:px-6 pb-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-gray-100">
              <Clock className="w-3.5 h-3.5 text-gray-700" />
              <h3 className="font-bold text-[12px] text-gray-900">Kitchen Timings</h3>
            </div>
            <div className="px-3 py-3 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <div className={cn("w-1.5 h-1.5 rounded-full", status.isOpen ? "bg-green-500" : "bg-red-500")} />
                <span className={cn("text-[11px] font-bold", status.isOpen ? "text-green-600" : "text-red-600")}>
                  {status.isOpen ? "Open Today" : "Closed"}
                </span>
              </div>
              <div className="text-[12px] font-bold text-gray-900">{timingInfo.timeRange}</div>
              <div className="text-[10px] text-muted-foreground">{timingInfo.dayRange}</div>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-gray-100">
              <Truck className="w-3.5 h-3.5 text-gray-700" />
              <h3 className="font-bold text-[12px] text-gray-900">Delivery Information</h3>
            </div>
            <div className="px-3 py-3 space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-muted-foreground">Delivery Time</span>
                <span className="font-semibold text-gray-900">{deliveryTimeRange}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#FFF7F0] rounded-lg p-2.5 text-[10px] font-medium text-muted-foreground text-center border border-orange-100">
          Track your order in real-time once it&apos;s confirmed.
        </div>

        <div className="bg-[#E8F5E9] rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-green-200">
                <ShieldCheck className="w-5 h-5 text-green-600" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-600 rounded-full border-2 border-white flex items-center justify-center">
                <Check className="w-2 h-2 text-white stroke-[3]" />
              </div>
            </div>
            <h3 className="font-bold text-[13px] text-gray-900">
              We follow highest <span className="text-green-700">hygiene</span> standards
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-green-600 shrink-0" />
              <span className="text-[10px] text-gray-600">Regular kitchen sanitization</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-green-600 shrink-0" />
              <span className="text-[10px] text-gray-600">Safe & hygienic packaging</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-green-600 shrink-0" />
              <span className="text-[10px] text-gray-600">Fresh ingredients daily</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-green-600 shrink-0" />
              <span className="text-[10px] text-gray-600">Trained & verified home chefs</span>
            </div>
          </div>
        </div>
      </div>

      <AddToCartPopup
        item={popupItem}
        qty={popupItem ? (cartItems.find(ci => ci.id === popupItem.id)?.qty ?? 1) : 1}
        open={popupOpen}
        onOpenChange={setPopupOpen}
      />
    </main>
  );
}
