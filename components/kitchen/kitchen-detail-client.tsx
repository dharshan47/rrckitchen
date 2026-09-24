"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCartActions, useCartItems, useKitchenDetail, useKitchenDetailActions, useMenuDeliveryLat, useMenuDeliveryLng } from "@/stores";
import Image from "next/image";
import {
  Search, Star, Check, ShieldCheck, Clock, Leaf, Package, Heart,
  Users, ShoppingBag, Calendar, ChevronDown, CheckCircle2,
  ThumbsUp, Coffee, UtensilsCrossed, Utensils, Box, Sandwich,
  Truck, BadgePercent, MapPin, Loader2, type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { haversineDistance, THANJAVUR_CENTER } from "@/lib/geo";
import { useSession } from "@/lib/auth-client";
import { AddToCartPopup, type AddPopupItem } from "@/components/menu/add-to-cart-popup";
import { CompoundMenuCard, VegIcon, NonVegIcon } from "@/components/patterns/compound-menu-card";
import { getKitchenStatus, type KitchenStatus, type OperatingHours } from "@/components/kitchen/kitchen-timing-display";
import { AboutKitchenTab } from "@/components/kitchen/about-kitchen-tab";
import { ReviewsKitchenTab } from "@/components/kitchen/reviews-kitchen-tab";
import { InfoKitchenTab } from "@/components/kitchen/info-kitchen-tab";
import {
  AboutKitchenTabSkeleton,
  InfoKitchenTabSkeleton,
  ReviewsKitchenTabSkeleton,
} from "@/components/kitchen/kitchen-tab-skeletons";
import { getKitchenDetailLive } from "@/actions/catalog/kitchen-detail";
import { getCartConfig } from "@/actions/cart-checkout/config";
import { useAblyKitchenChannel } from "@/hooks/useAblySubscribe";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  avgRating?: number | null;
  totalReviews?: number;
  deliveryFee?: number | null;
  freeDelivery?: boolean;
}

export interface KitchenDetail {
  id: string;
  slug: string;
  displayName: string;
  avgRating: number | null;
  totalReviews: number;
  imageUrl: string | null;
  kpProfileImageUrl?: string | null;
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
  story?: string | null;
  experienceYears?: number | null;
  fssaiNumber?: string | null;
  fssaiValidTill?: string | null;
  gstNumber?: string | null;
  kitchenId?: string | null;
  minOrder?: number | null;
  deliveryRadiusKm?: number | null;
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

type KitchenOffer = {
  code: string;
  description: string;
  discountValue: number;
  discountType: string;
  minOrderValue: number | null;
};

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

export function KitchenDetailClient({ kitchen: initialKitchen, initialTimeSlot, initialSearchQuery }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const storeKitchen = useKitchenDetail();
  const { hydrate } = useKitchenDetailActions();
  const { data: session } = useSession();
  const deliveryLat = useMenuDeliveryLat();
  const deliveryLng = useMenuDeliveryLng();

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
  const [activeCategory, setActiveCategory] = useState<string>(initialTimeSlot ?? "Recommended");
  const [popupItem, setPopupItem] = useState<AddPopupItem | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [foodFilter, setFoodFilter] = useState<"ALL" | "VEG" | "NONVEG">("ALL");
  const [bestsellerOnly, setBestsellerOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"popularity" | "rating" | "price-low" | "price-high">("popularity");
  const [showFullMenu, setShowFullMenu] = useState(false);
  const [nameFilter, setNameFilter] = useState<string | null>(null);
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedDietPrefs, setSelectedDietPrefs] = useState<string[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [status, setStatus] = useState<KitchenStatus>(() => getKitchenStatus(kitchen.operatingHours ?? null));

  // Re-evaluate open/closed status immediately and every minute so the badge stays live
  useEffect(() => {
    const computeStatus = () => {
      const newStatus = getKitchenStatus(kitchen.operatingHours ?? null);
      setStatus((prev) => {
        if (
          prev.isOpen === newStatus.isOpen &&
          prev.closeTime === newStatus.closeTime &&
          prev.opensNextAt?.time === newStatus.opensNextAt?.time
        ) {
          return prev;
        }
        return newStatus;
      });
    };
    computeStatus();
    const timer = window.setInterval(computeStatus, 60_000);
    return () => window.clearInterval(timer);
  }, [kitchen.operatingHours]);

  // Real checkout charges config (delivery fee, packaging, free-delivery threshold)
  const { data: cartConfig } = useQuery({
    queryKey: ["cart-config"],
    queryFn: getCartConfig,
    staleTime: 60_000,
  });

  // Real coupon offers for this kitchen (platform-wide + kitchen-specific)
  const { data: kitchenOffers = [] } = useQuery<KitchenOffer[]>({
    queryKey: ["kitchen-coupons", kitchen.id],
    queryFn: async () => {
      const res = await fetch(`/api/kitchen/coupons?kitchenPartnerId=${encodeURIComponent(kitchen.id)}`);
      if (!res.ok) return [];
      const json = (await res.json()) as { coupons: KitchenOffer[] };
      return json.coupons ?? [];
    },
    staleTime: 60_000,
  });

  // Check whether the customer already follows this kitchen
  useEffect(() => {
    if (!session?.user?.id) return;
    let cancelled = false;
    fetch("/api/kitchen/wishlist")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (cancelled) return;
        const items = (json?.items ?? []) as { kitchenPartnerId: string }[];
        setIsFollowing(items.some((w) => w.kitchenPartnerId === kitchen.id));
      })
      .catch(() => {
        if (!cancelled) setIsFollowing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, kitchen.id]);

  const handleToggleFollow = useCallback(async () => {
    if (!session?.user?.id) {
      router.push("/login");
      return;
    }
    setFollowBusy(true);
    try {
      const res = await fetch("/api/kitchen/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kitchenPartnerId: kitchen.id }),
      });
      if (!res.ok) throw new Error("Failed to toggle follow");
      const json = (await res.json()) as { added?: boolean; removed?: boolean };
      setIsFollowing(!!json.added);
    } catch {
      // keep current state on failure
    } finally {
      setFollowBusy(false);
    }
  }, [session?.user?.id, kitchen.id, router]);

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
  const isPureVeg = kitchen.hasPureVeg ?? (kitchen.items.length > 0 && kitchen.items.every(i => i.foodType === "VEG"));
  const platformTime = kitchen.timeOnPlatform ?? "—";

  const displayRating = kitchen.avgRating;

  // Distance from the customer's delivery location to the kitchen (falls back
  // to the Thanjavur city center when no delivery location is set yet).
  const kitchenLat = kitchen.address?.latitude ?? null;
  const kitchenLng = kitchen.address?.longitude ?? null;
  const distanceKm = useMemo(() => {
    if (kitchenLat == null || kitchenLng == null) return null;
    const kLat = Number(kitchenLat);
    const kLng = Number(kitchenLng);
    if (isNaN(kLat) || isNaN(kLng)) return null;

    return haversineDistance(
      deliveryLat ?? THANJAVUR_CENTER[0],
      deliveryLng ?? THANJAVUR_CENTER[1],
      kLat,
      kLng
    );
  }, [deliveryLat, deliveryLng, kitchenLat, kitchenLng]);
  const distanceLabel = distanceKm == null ? "—" : distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`;

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

    if (nameFilter) {
      const q = nameFilter.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q));
    }

    if (selectedMealTypes.length > 0) {
      items = items.filter(i => {
        const label = TIME_SLOT_CONFIG[i.timeSlot]?.label ?? i.timeSlot;
        return selectedMealTypes.includes(label);
      });
    }

    if (selectedDietPrefs.length > 0) {
      items = items.filter(i => selectedDietPrefs.includes(i.foodType === "VEG" ? "Pure Veg" : "Non Veg"));
    }

    if (selectedCuisines.length > 0) {
      const matches = selectedCuisines.some(c => kitchen.cuisineTags.some(t => t.toLowerCase() === c.toLowerCase()));
      if (!matches) items = [];
    }

    if (foodFilter !== "ALL") {
      items = items.filter(i => i.foodType === foodFilter);
    }

    if (bestsellerOnly) {
      items = items.filter(i => i.isBestseller);
    }

    if (sortBy === "rating") {
      items.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
    } else if (sortBy === "price-low") {
      items.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      items.sort((a, b) => b.price - a.price);
    } else {
      items.sort((a, b) => (b.orderCount ?? 0) - (a.orderCount ?? 0));
    }

    if (activeCategory === "Recommended") {
      return showFullMenu ? items : items.slice(0, 10);
    }
    return items.filter(i => i.timeSlot === activeCategory);
  }, [kitchen.items, activeCategory, searchQuery, foodFilter, bestsellerOnly, sortBy, showFullMenu, nameFilter, selectedMealTypes, selectedCuisines, selectedDietPrefs, kitchen.cuisineTags]);

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

  const renderSidebarCards = () => (
    <div className="flex flex-col gap-4">
      {kitchenOffers.length > 0 && (
        <div className="bg-[#FFFBF7] rounded-[20px] p-5 md:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#F5EFEA]">
          <div className="flex items-center gap-3 mb-4">
            <BadgePercent className="w-[18px] h-[18px] md:w-5 md:h-5 text-[#FF4D00]" strokeWidth={2} />
            <h3 className="font-bold text-[15px] md:text-[16px] text-[#111111]">Kitchen Offers</h3>
          </div>
          <div className="space-y-4">
            {kitchenOffers.map((offer) => (
              <div key={offer.code} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF4D00] mt-2 shrink-0" />
                <div>
                  <div className="text-[13px] font-bold text-[#111111]">
                    {offer.discountType === "PERCENTAGE" ? `${offer.discountValue}% OFF` : `Flat ₹${offer.discountValue} OFF`}
                    {offer.minOrderValue ? <span className="text-[#888888] font-semibold"> | Above ₹{offer.minOrderValue}</span> : null}
                  </div>
                  <div className="text-[11px] text-[#555555] font-medium mt-0.5">Use code {offer.code}</div>
                  {offer.description && (
                    <div className="text-[11px] text-[#888888] font-medium mt-0.5">{offer.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[#FFFBF7] rounded-[20px] p-5 md:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#F5EFEA]">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-[18px] h-[18px] md:w-5 md:h-5 text-[#111111]" strokeWidth={2} />
          <h3 className="font-bold text-[15px] md:text-[16px] text-[#111111]">Kitchen Timings</h3>
        </div>
        <div className="ml-[30px] md:ml-[32px] space-y-1.5 md:space-y-2">
          <div className={cn("text-[13px] md:text-[14px] font-bold", status.isOpen ? "text-[#087A36]" : "text-[#E02020]")}>
            {status.isOpen ? "Open Today" : "Closed"}
          </div>
          <div className="text-[13px] md:text-[14px] font-bold text-[#111111]">{timingInfo.timeRange}</div>
          <div className="text-[12px] md:text-[13px] text-[#555555] font-medium">{timingInfo.dayRange}</div>
        </div>
      </div>

      <div className="bg-[#FFFBF7] rounded-[20px] p-5 md:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#F5EFEA]">
        <div className="flex items-center gap-3 mb-4 md:mb-5">
          <Truck className="w-[18px] h-[18px] md:w-5 md:h-5 text-[#087A36]" strokeWidth={2.5} />
          <h3 className="font-bold text-[15px] md:text-[16px] text-[#111111]">Delivery Information</h3>
        </div>
        <div className="space-y-3.5 md:space-y-4 mb-4 md:mb-5">
          <div className="flex justify-between items-center text-[12px] md:text-[13px]">
            <span className="text-[#555555] font-semibold">Delivery Time</span>
            <span className="font-bold text-[#111111]">{deliveryTimeRange}</span>
          </div>
          <div className="flex justify-between items-center text-[12px] md:text-[13px]">
            <span className="text-[#555555] font-semibold">Delivery Charge</span>
            <span className="font-bold text-[#111111]">
              {cartConfig ? `₹${cartConfig.deliveryCharge}` : "—"}
              {cartConfig && cartConfig.freeDeliveryMin > 0 ? <span className="text-[#888888] font-medium ml-1">(Free above ₹{cartConfig.freeDeliveryMin})</span> : null}
            </span>
          </div>
          <div className="flex justify-between items-center text-[12px] md:text-[13px]">
            <span className="text-[#555555] font-semibold">Minimum Order</span>
            <span className="font-bold text-[#111111]">₹{kitchen.minOrder || 99}</span>
          </div>
          <div className="flex justify-between items-center text-[12px] md:text-[13px]">
            <span className="text-[#555555] font-semibold">Packaging Charge</span>
            <span className="font-bold text-[#111111]">{cartConfig ? `₹${cartConfig.packagingCharge}` : "—"}</span>
          </div>
        </div>
        <div className="bg-[#FFF1E5] rounded-[10px] p-3.5 text-[11px] md:text-[12px] font-medium text-[#555555] leading-relaxed">
          Track your order in real-time<br className="hidden lg:block" /> once it&apos;s confirmed.
        </div>
      </div>

      <div className="bg-[#FFFBF7] rounded-[20px] p-5 md:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#F5EFEA] flex justify-between gap-2">
        <div className="flex-1">
          <h3 className="font-extrabold text-[14px] md:text-[15px] text-[#111111] leading-snug mb-4">
            We follow highest<br />
            <span className="text-[#087A36]">hygiene</span> standards
          </h3>
          <div className="space-y-2.5 md:space-y-3">
            <div className="flex items-center gap-2.5">
              <Check className="w-3.5 h-3.5 text-[#087A36] shrink-0 stroke-[3]" />
              <span className="text-[12px] md:text-[13px] text-[#555555] font-medium">Regular kitchen sanitization</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-3.5 h-3.5 text-[#087A36] shrink-0 stroke-[3]" />
              <span className="text-[12px] md:text-[13px] text-[#555555] font-medium">Fresh ingredients daily</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-3.5 h-3.5 text-[#087A36] shrink-0 stroke-[3]" />
              <span className="text-[12px] md:text-[13px] text-[#555555] font-medium">Safe & hygienic packaging</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-3.5 h-3.5 text-[#087A36] shrink-0 stroke-[3]" />
              <span className="text-[12px] md:text-[13px] text-[#555555] font-medium">Trained & verified home chefs</span>
            </div>
          </div>
        </div>
        <div className="shrink-0 self-end mr-2 md:mr-3 mb-1">
          <Image src="/kitchen/shield-tick.webp" alt="Hygiene Shield" width={72} height={72} className="object-contain w-[64px] h-[64px] md:w-[72px] md:h-[72px]" />
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#fcfbf9] text-foreground pb-20 lg:pb-20" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>

      <div className="bg-[#FEF9F5]">
        <div className="block">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-3 md:py-4">
            <div className="text-[13px] font-medium text-[#555555] flex items-center gap-2">
              <Link href="/" className="hover:text-primary cursor-pointer transition-colors">Home</Link>
              <span className="text-[#999999]">›</span>
              <Link href="/kitchens" className="hover:text-primary cursor-pointer transition-colors">Kitchens</Link>
              <span className="text-[#999999]">›</span>
              <span className="text-[#101010] font-semibold">{kitchen.displayName}</span>
            </div>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-4 md:px-6 pb-4 md:pb-6">
          <div className="bg-[#FFFFFF] border border-[#f0f0f0] rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.04)] p-3 md:p-4">
            <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8">

              <div className="relative w-full lg:w-[420px] h-[200px] md:h-[240px] lg:h-[280px] shrink-0 rounded-[12px] bg-[#FEF9F5]">
                {kitchen.imageUrl ? (
                  <>
                    <Image src={kitchen.imageUrl} alt={kitchen.displayName} fill sizes="(min-width: 1024px) 420px, 100vw" className="object-cover rounded-[12px]" priority />
                    <div className="absolute inset-0 rounded-[12px] pointer-events-none bg-[linear-gradient(to_top,rgba(0,0,0,0.5)_0%,rgba(0,0,0,0)_30%,rgba(0,0,0,0)_70%,rgba(0,0,0,0.2)_100%)]" />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center rounded-[12px] bg-gray-100">
                    <UtensilsCrossed className="w-10 md:w-12 h-10 md:h-12 text-[#FF4D00] opacity-20" />
                  </div>
                )}

                {hasBestseller && (
                  <div className="absolute top-4 left-4 bg-[#FF4D00] text-[#FFFFFF] text-[11px] md:text-[12px] font-bold px-3 py-1.5 rounded-[6px] shadow-sm z-10">
                    Bestseller
                  </div>
                )}

                <div className="absolute -bottom-[35px] md:-bottom-[40px] left-4 flex items-end gap-3 z-20">
                  {isPureVeg && (
                    <div className="mb-[51px] md:mb-[56px] bg-[#FFFFFF] text-[#087A36] text-[10px] md:text-[11px] font-bold px-2 py-1.5 rounded-[5px] shadow-sm flex gap-1.5 items-center">
                      <VegIcon className="w-3.5 h-3.5" /> PURE VEG
                    </div>
                  )}
                  <div className="relative w-[80px] md:w-[90px] h-[80px] md:h-[90px] rounded-full border-[2.5px] border-[#FFFFFF] bg-white overflow-hidden shadow-sm shrink-0">
                    <Image src={kitchen.kpProfileImageUrl || "/kitchen/profile.webp"} alt="Chef" fill sizes="90px" className="object-cover" />
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-start pt-10 md:pt-14 lg:pt-2 pl-2 lg:pl-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-[22px] md:text-[26px] font-bold text-[#111111] leading-tight truncate">{kitchen.displayName}</h1>
                  <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] shrink-0 text-[#087A36] fill-[#087A36]">
                    <path d="M10.52 1.34L11.4 1.95a2 2 0 0 0 2.2 0l.88-.61a2 2 0 0 1 3.03 1.14l.32 1.03a2 2 0 0 0 1.63 1.36l1.05.15a2 2 0 0 1 1.67 2.6l-.42.99a2 2 0 0 0 .19 2.1l.73.82a2 2 0 0 1-.22 2.94l-.86.7a2 2 0 0 0-.67 1.98l.26 1.04a2 2 0 0 1-2.2 2.5l-1.06-.21a2 2 0 0 0-2.01.62l-.7.83a2 2 0 0 1-3.07.13l-.78-.76a2 2 0 0 0-2.14-.32l-1.01.37a2 2 0 0 1-2.73-1.63l-.15-1.07a2 2 0 0 0-1.25-1.68l-1-.44a2 2 0 0 1-1.02-2.92l.62-.89a2 2 0 0 0 0-2.1l-.62-.89a2 2 0 0 1 1.02-2.92l1-.44a2 2 0 0 0 1.25-1.68l.15-1.07a2 2 0 0 1 2.73-1.63l1.01.37a2 2 0 0 0 2.14-.32l.78-.76a2 2 0 0 1 1.39-.18Z" />
                    <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </div>

                <div className="flex items-center flex-wrap gap-2 md:gap-4 mt-2 md:mt-3 text-[12px] md:text-[13px] text-[#555555] font-medium">
                  <div className="flex items-center gap-1 text-[#FF8A00] font-bold">
                    {displayRating && displayRating > 0 ? (
                      <>
                        <span>{displayRating.toFixed(1)}</span>
                        <Star className="w-4 h-4 fill-[#FF8A00] text-[#FF8A00]" />
                        <span className="text-[#555555] ml-1 font-medium">({kitchen.totalReviews} Reviews)</span>
                      </>
                    ) : (
                      <span className="text-[#595959] font-medium">New</span>
                    )}
                  </div>
                  <div className="w-px h-3.5 bg-[#E0E0E0] hidden md:block"></div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#888888]" />
                    <span>{deliveryTimeRange}</span>
                  </div>
                  <div className="w-px h-3.5 bg-[#E0E0E0] hidden md:block"></div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#888888]" />
                    <span>{distanceLabel}</span>
                  </div>
                  {isPureVeg && (
                    <>
                      <div className="w-px h-3.5 bg-[#E0E0E0] hidden md:block"></div>
                      <div className="flex items-center gap-1.5 text-[#087A36]">
                        <div className="w-2 h-2 rounded-full bg-[#087A36]" />
                        <span>Pure Veg</span>
                      </div>
                    </>
                  )}
                </div>

                {kitchen.cuisineTags.length > 0 && (
                  <div className="text-[12px] md:text-[13px] text-[#555555] mt-3 md:mt-4 font-normal flex items-center flex-wrap gap-1.5">
                    {kitchen.cuisineTags.map((tag, i) => (
                      <span key={i} className="flex items-center gap-1.5">
                        {tag}
                        {i < kitchen.cuisineTags.length - 1 && <span className="text-[#999999]">·</span>}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-[12px] md:text-[13px] text-[#555555] mt-3 md:mt-4 leading-[1.6] max-w-2xl font-normal line-clamp-2 md:line-clamp-none pr-4">
                  {kitchen.description || "Serving delicious, homemade meals with love and care. Every dish is prepared fresh daily using quality ingredients and traditional cooking methods."}
                </p>

                <div className="flex flex-wrap gap-3 mt-5 md:mt-6">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] border border-[#F0F0F0] text-[#333333] text-[11px] font-medium bg-[#FFFFFF] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                    <ShieldCheck className="w-4 h-4 text-[#087A36]" strokeWidth={2.5} /> Hygienic Kitchen
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] border border-[#F0F0F0] text-[#333333] text-[11px] font-medium bg-[#FFFFFF] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                    <Clock className="w-4 h-4 text-[#FF4D00]" strokeWidth={2.5} /> On-time Delivery
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] border border-[#F0F0F0] text-[#333333] text-[11px] font-medium bg-[#FFFFFF] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                    <Leaf className="w-4 h-4 text-[#087A36]" strokeWidth={2.5} /> Fresh Ingredients
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] border border-[#F0F0F0] text-[#333333] text-[11px] font-medium bg-[#FFFFFF] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                    <Package className="w-4 h-4 text-[#FF4D00]" strokeWidth={2.5} /> Safe & Secure Packaging
                  </div>
                </div>

                <div className="mt-6 md:mt-auto pt-4 text-[11px] md:text-[12px] text-[#888888] font-normal">
                  Open Today: {timingInfo.timeRange}
                </div>
              </div>

              <div className="hidden lg:flex flex-col w-[260px] shrink-0 pl-6 border-l border-[#F0F0F0]">
                <button
                  onClick={handleToggleFollow}
                  disabled={followBusy}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-[8px] w-full py-2.5 font-semibold text-[13px] transition-colors mb-6 border shadow-[0_2px_8px_rgba(0,0,0,0.02)]",
                    isFollowing
                      ? "bg-[#FFF1F1] text-[#E02020] border-[#FFD0D0] hover:bg-[#FFE4E4]"
                      : "bg-[#FFFFFF] text-[#111111] border-[#E8E8E8] hover:bg-[#F9F9F9]"
                  )}
                >
                  {followBusy ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#FF4D00]" />
                  ) : (
                    <Heart className={cn("w-4 h-4", isFollowing ? "fill-[#E02020] text-[#E02020]" : "text-[#FF4D00]")} strokeWidth={2} />
                  )}
                  {isFollowing ? "Following" : "Follow Kitchen"}
                </button>

                <div className="flex flex-col">
                  <div className="flex items-center gap-4 py-3 border-b border-[#F5F5F5]">
                    <Users className="w-[18px] h-[18px] text-[#087A36]" strokeWidth={2} />
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[14px] text-[#111111] w-[45px]">{totalOrders > 0 ? formatCount(totalOrders) : "0"}</span>
                      <span className="text-[12px] text-[#666666] font-normal">Happy Customers</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 py-3 border-b border-[#F5F5F5]">
                    <Star className="w-[18px] h-[18px] text-[#087A36]" strokeWidth={2} />
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[14px] text-[#111111] w-[45px] flex items-center gap-1">
                        {displayRating && displayRating > 0 ? displayRating.toFixed(1) : "—"}
                        {displayRating && displayRating > 0 && <Star className="w-3 h-3 fill-[#FF8A00] text-[#FF8A00]" />}
                      </span>
                      <span className="text-[12px] text-[#666666] font-normal">Average Rating</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 py-3 border-b border-[#F5F5F5]">
                    <ShoppingBag className="w-[18px] h-[18px] text-[#087A36]" strokeWidth={2} />
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[14px] text-[#111111] w-[45px]">{totalOrders > 0 ? formatCount(totalOrders) : "0"}</span>
                      <span className="text-[12px] text-[#666666] font-normal">Orders Delivered</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 py-3">
                    <Calendar className="w-[18px] h-[18px] text-[#087A36]" strokeWidth={2} />
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[14px] text-[#111111] w-[45px]">{platformTime !== "—" ? platformTime : "New"}</span>
                      <span className="text-[12px] text-[#666666] font-normal">On RRC Kitchen</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="xl:hidden bg-[#FFFFFF] border-b border-[#eef1f5] overflow-x-auto px-4 md:px-6 py-3" style={{ scrollbarWidth: 'none' }}>
        <div className="flex items-stretch gap-0 justify-between min-w-[460px]">
          <button onClick={handleToggleFollow} disabled={followBusy} className="flex flex-col items-center gap-1.5 px-3">
            <div className={cn("w-10 h-10 rounded-full border flex items-center justify-center bg-[#FFFFFF]", isFollowing ? "border-[#FFD0D0] bg-[#FFF1F1]" : "border-[#E8E8E8]")}>
              {followBusy ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#FF4D00]" />
              ) : (
                <Heart className={cn("w-4 h-4", isFollowing ? "fill-[#E02020] text-[#E02020]" : "text-[#FF4D00]")} />
              )}
            </div>
            <span className="text-[10px] text-[#555555] font-medium whitespace-nowrap">{isFollowing ? "Following" : "Follow Kitchen"}</span>
          </button>
          <div className="flex flex-col items-center gap-1.5 px-3">
            <div className="w-10 h-10 rounded-full border border-[#E8E8E8] flex items-center justify-center bg-[#F0F8F3] text-[#087A36]">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-center">
              <div className="text-[12px] font-bold text-[#171717]">{totalOrders > 0 ? formatCount(totalOrders) : "0"}</div>
              <div className="text-[9px] text-[#555555] font-medium">Happy Customers</div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1.5 px-3">
            <div className="w-10 h-10 rounded-full border border-[#E8E8E8] flex items-center justify-center bg-[#FFF7F0] text-[#FF4D00]">
              <Star className="w-4 h-4" />
            </div>
            <div className="text-center">
              <div className="text-[12px] font-bold text-[#171717] flex items-center gap-0.5 justify-center">{displayRating && displayRating > 0 ? displayRating.toFixed(1) : "—"} {displayRating && displayRating > 0 && <Star className="w-2.5 h-2.5 fill-[#FF8A00] text-[#FF8A00]" />}</div>
              <div className="text-[9px] text-[#555555] font-medium">Average Rating</div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1.5 px-3">
            <div className="w-10 h-10 rounded-full border border-[#E8E8E8] flex items-center justify-center bg-[#F0F8F3] text-[#087A36]">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="text-center">
              <div className="text-[12px] font-bold text-[#171717]">{totalOrders > 0 ? formatCount(totalOrders) : "0"}</div>
              <div className="text-[9px] text-[#555555] font-medium">Orders Delivered</div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1.5 px-3">
            <div className="w-10 h-10 rounded-full border border-[#E8E8E8] flex items-center justify-center bg-[#F0F8F3] text-[#087A36]">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="text-center">
              <div className="text-[12px] font-bold text-[#171717]">{platformTime !== "—" ? platformTime : "New"}</div>
              <div className="text-[9px] text-[#555555] font-medium">On RRC Kitchen</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#FFFFFF] border-b border-[#eef1f5] sticky top-0 z-30 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="flex items-center justify-start md:justify-center gap-8 md:gap-16 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setActiveTab("menu")}
              className={cn("py-4 md:py-5 font-semibold text-[14px] md:text-[15px] whitespace-nowrap border-b-[2px] transition-colors flex items-center gap-2",
                activeTab === "menu" ? "border-[#FF4D00] text-[#FF4D00]" : "border-transparent text-[#555555] hover:text-[#171717]"
              )}
            >
              <UtensilsCrossed className={cn("w-4 md:w-5 h-4 md:h-5", activeTab === "menu" ? "text-[#FF4D00]" : "text-[#555555]")} /> Menu
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={cn("py-4 md:py-5 font-semibold text-[14px] md:text-[15px] whitespace-nowrap border-b-[2px] transition-colors flex items-center gap-2",
                activeTab === "about" ? "border-[#FF4D00] text-[#FF4D00]" : "border-transparent text-[#555555] hover:text-[#171717]"
              )}
            >
              <Users className={cn("w-4 md:w-5 h-4 md:h-5", activeTab === "about" ? "text-[#FF4D00]" : "text-[#555555]")} /> About Kitchen
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={cn("py-4 md:py-5 font-semibold text-[14px] md:text-[15px] whitespace-nowrap border-b-[2px] transition-colors flex items-center gap-2",
                activeTab === "reviews" ? "border-[#FF4D00] text-[#FF4D00]" : "border-transparent text-[#555555] hover:text-[#171717]"
              )}
            >
              <Star className={cn("w-4 md:w-5 h-4 md:h-5", activeTab === "reviews" ? "text-[#FF4D00]" : "text-[#555555]")} /> Reviews ({kitchen.totalReviews})
            </button>
            <button
              onClick={() => setActiveTab("info")}
              className={cn("py-4 md:py-5 font-semibold text-[14px] md:text-[15px] whitespace-nowrap border-b-[2px] transition-colors flex items-center gap-2",
                activeTab === "info" ? "border-[#FF4D00] text-[#FF4D00]" : "border-transparent text-[#555555] hover:text-[#171717]"
              )}
            >
              <CheckCircle2 className={cn("w-4 md:w-5 h-4 md:h-5", activeTab === "info" ? "text-[#FF4D00]" : "text-[#555555]")} /> Kitchen Information
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-4 md:py-6">
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">

          {activeTab === "menu" && !searchQuery && (
            <div className="w-full lg:w-[260px] shrink-0">
              <div className="bg-[#FFFBF7] lg:sticky lg:top-[100px] rounded-[24px] border border-[#F5EFEA] shadow-sm p-4 md:p-5">
                <h3 className="font-extrabold text-[16px] md:text-[18px] text-[#111111] mb-3 md:mb-4 px-1">Menu Categories</h3>
                <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 lg:gap-0" style={{ scrollbarWidth: 'none' }}>
                  {menuCategories.map((cat: MenuCategory, index: number) => {
                    const isActive = activeCategory === cat.id;
                    return (
                      <div key={cat.id} className={cn("relative", !isActive && index !== menuCategories.length - 1 && "lg:after:content-[''] lg:after:absolute lg:after:bottom-0 lg:after:left-4 lg:after:right-4 lg:after:h-px lg:after:bg-[#F0E6DD] lg:after:opacity-60")}>
                        <button
                          onClick={() => setActiveCategory(cat.id)}
                          className={cn(
                            "flex items-center gap-3.5 px-4 py-3.5 transition-all text-left text-[14px] whitespace-nowrap shrink-0 group w-full",
                            isActive
                              ? "bg-[#FFFFFF] text-[#FF6B00] font-bold rounded-[12px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] lg:my-1 border border-[#F5F5F5] lg:border-none"
                              : "text-[#087A36] font-semibold hover:bg-[#FFFFFF]/40 rounded-[12px]"
                          )}
                        >
                          <cat.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-[#FF6B00]" : "text-[#087A36]")} strokeWidth={isActive ? 2.5 : 2} />
                          <span>{cat.label}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "menu" && searchQuery && (
            <div className="w-full lg:w-[240px] shrink-0">
              <div className="bg-[#FFFFFF] rounded-[26px] shadow-[0_10px_28px_rgba(15,23,42,0.05)] border border-[#eef1f5] overflow-hidden lg:sticky lg:top-[65px] p-4 md:p-5">
                <div className="flex items-center justify-between mb-5 border-b border-[#EEEEEE] pb-3">
                  <h3 className="font-extrabold text-[15px] text-[#171717]">Filters</h3>
                  <button
                    className="text-[11px] font-bold text-[#FF4D00]"
                    onClick={() => { setSearchQuery(""); setNameFilter(null); setSelectedMealTypes([]); setSelectedCuisines([]); setSelectedDietPrefs([]); }}
                  >
                    Clear All
                  </button>
                </div>

                {/* Meal Type */}
                {searchFilterOptions.mealTypes.length > 0 && (
                  <div className="mb-5">
                    <h4 className="font-bold text-[13px] text-[#171717] flex items-center justify-between mb-3">
                      Meal Type <ChevronDown className="h-3.5 w-3.5 text-[#888888]" />
                    </h4>
                    <div className="space-y-2.5">
                      {searchFilterOptions.mealTypes.map((type) => (
                        <label key={type} className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-3.5 h-3.5 rounded-sm border-[#DDDDDD] text-[#FF4D00] focus:ring-[#FF4D00]"
                            checked={selectedMealTypes.includes(type)}
                            onChange={(e) =>
                              setSelectedMealTypes(prev =>
                                e.target.checked ? [...prev, type] : prev.filter(t => t !== type)
                              )
                            }
                          />
                          <span className="text-[12px] font-semibold text-[#555555]">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cuisine */}
                {searchFilterOptions.cuisines.length > 0 && (
                  <div className="mb-5">
                    <h4 className="font-bold text-[13px] text-[#171717] flex items-center justify-between mb-3">
                      Cuisine <ChevronDown className="h-3.5 w-3.5 text-[#888888]" />
                    </h4>
                    <div className="space-y-2.5">
                      {searchFilterOptions.cuisines.map((type) => (
                        <label key={type} className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-3.5 h-3.5 rounded-sm border-[#DDDDDD] text-[#FF4D00] focus:ring-[#FF4D00]"
                            checked={selectedCuisines.includes(type)}
                            onChange={(e) =>
                              setSelectedCuisines(prev =>
                                e.target.checked ? [...prev, type] : prev.filter(t => t !== type)
                              )
                            }
                          />
                          <span className="text-[12px] font-semibold text-[#555555]">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Diet Preference */}
                {searchFilterOptions.dietPrefs.length > 0 && (
                  <div>
                    <h4 className="font-bold text-[13px] text-[#171717] flex items-center justify-between mb-3">
                      Diet Preference <ChevronDown className="h-3.5 w-3.5 text-[#888888]" />
                    </h4>
                    <div className="space-y-2.5">
                      {searchFilterOptions.dietPrefs.map((type) => (
                        <label key={type} className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-3.5 h-3.5 rounded-sm border-[#DDDDDD] text-[#FF4D00] focus:ring-[#FF4D00]"
                            checked={selectedDietPrefs.includes(type)}
                            onChange={(e) =>
                              setSelectedDietPrefs(prev =>
                                e.target.checked ? [...prev, type] : prev.filter(t => t !== type)
                              )
                            }
                          />
                          <span className="text-[12px] font-semibold text-[#555555]">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <Suspense
              fallback={
                activeTab === "about" ? (
                  <AboutKitchenTabSkeleton />
                ) : activeTab === "reviews" ? (
                  <ReviewsKitchenTabSkeleton />
                ) : activeTab === "info" ? (
                  <InfoKitchenTabSkeleton />
                ) : null
              }
            >
              {activeTab === "menu" ? (
                <>
                  <div className="relative mb-4 md:mb-5">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
                    <input
                      type="text"
                      placeholder="Search for dishes"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-[12px] border border-[#EEEEEE] bg-[#FFFFFF] text-[13px] md:text-[14px] text-[#171717] font-medium outline-none focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00]/20 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
                    />
                  </div>

                  {!searchQuery ? (
                    <>
                      <div className="flex items-center gap-2 mb-4 md:mb-6 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                        <button
                          onClick={() => { setFoodFilter("ALL"); setBestsellerOnly(false); }}
                          className={cn("px-4 py-2 rounded-[8px] text-[12px] font-bold whitespace-nowrap transition-colors border shadow-sm",
                            foodFilter === "ALL" && !bestsellerOnly
                              ? "bg-[#FF4D00] text-[#FFFFFF] border-[#FF4D00]"
                              : "bg-[#FFFFFF] text-[#555555] border-[#E8E8E8] hover:bg-[#F9F9F9]"
                          )}
                        >
                          All
                        </button>
                        <button
                          onClick={() => setFoodFilter(foodFilter === "VEG" ? "ALL" : "VEG")}
                          className={cn("px-4 py-2 rounded-[8px] text-[12px] font-bold whitespace-nowrap transition-colors border shadow-sm flex items-center gap-1.5",
                            foodFilter === "VEG"
                              ? "bg-[#F0F8F3] text-[#087A36] border-[#D9EBDD]"
                              : "bg-[#FFFFFF] text-[#555555] border-[#E8E8E8] hover:bg-[#F9F9F9]"
                          )}
                        >
                          <VegIcon className="w-3.5 h-3.5" /> Veg
                        </button>
                        <button
                          onClick={() => setFoodFilter(foodFilter === "NONVEG" ? "ALL" : "NONVEG")}
                          className={cn("px-4 py-2 rounded-[8px] text-[12px] font-bold whitespace-nowrap transition-colors border shadow-sm flex items-center gap-1.5",
                            foodFilter === "NONVEG"
                              ? "bg-[#FFF0F0] text-[#E02020] border-[#FAD4D4]"
                              : "bg-[#FFFFFF] text-[#555555] border-[#E8E8E8] hover:bg-[#F9F9F9]"
                          )}
                        >
                          <NonVegIcon className="w-3.5 h-3.5" /> Non Veg
                        </button>
                        {hasBestseller && (
                          <button
                            onClick={() => setBestsellerOnly(!bestsellerOnly)}
                            className={cn("px-4 py-2 rounded-[8px] text-[12px] font-bold whitespace-nowrap transition-colors border shadow-sm",
                              bestsellerOnly
                                ? "bg-[#FFF1E8] text-[#FF4D00] border-[#FFD0B5]"
                                : "bg-[#FFFFFF] text-[#555555] border-[#E8E8E8] hover:bg-[#F9F9F9]"
                            )}
                          >
                            Bestseller
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-between mb-4 md:mb-6">
                        <h2 className="text-[18px] md:text-[20px] font-bold text-[#101010]">
                          {activeCategory === "Recommended" ? "Recommended for You" : `${menuCategories.find((c: MenuCategory) => c.id === activeCategory)?.label}`}
                        </h2>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="flex items-center gap-2 text-[12px] md:text-[13px] text-[#555555] bg-[#FFFFFF] px-3 md:px-4 py-1.5 md:py-2 rounded-[8px] border border-[#E8E8E8] shadow-sm cursor-pointer font-medium hover:bg-[#F9F9F9]">
                              Sort by: <span className="text-[#171717] font-bold ml-1">{sortBy === "rating" ? "Rating" : sortBy === "price-low" ? "Price: Low to High" : sortBy === "price-high" ? "Price: High to Low" : "Popularity"}</span> <ChevronDown className="w-3.5 h-3.5 ml-1 text-[#171717]" />
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-[#FFFFFF] border-[#E5E5E5]">
                            <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                              <DropdownMenuRadioItem value="popularity">Popularity</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="rating">Rating</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="price-low">Price: Low to High</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="price-high">Price: High to Low</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 md:mb-5 gap-3">
                        <div>
                          <h2 className="text-[18px] md:text-[22px] font-bold text-[#101010]">
                            Menu for <span className="text-[#087A36]">&quot;{searchQuery}&quot;</span>
                          </h2>
                          <p className="text-[12px] md:text-[13px] font-bold text-[#555555] mt-1">
                            Showing {filteredItems.length} results for {searchQuery}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="flex items-center gap-1.5 text-[11px] md:text-[12px] text-[#555555] bg-[#FFFFFF] px-3 py-1.5 rounded-[8px] border border-[#E8E8E8] shadow-sm cursor-pointer hover:bg-[#F9F9F9] transition-colors shrink-0 self-start md:self-auto">
                              Sort by: <span className="text-[#171717] font-semibold ml-0.5">{sortBy === "rating" ? "Rating" : sortBy === "price-low" ? "Price: Low to High" : sortBy === "price-high" ? "Price: High to Low" : "Popularity"}</span> <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-[#555555]" />
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-[#FFFFFF] border-[#E5E5E5]">
                            <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                              <DropdownMenuRadioItem value="popularity">Popularity</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="rating">Rating</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="price-low">Price: Low to High</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="price-high">Price: High to Low</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center gap-2.5 mb-5 md:mb-6 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                        <button
                          onClick={() => setNameFilter(null)}
                          className={cn("px-3.5 py-1.5 rounded-[20px] text-[11px] md:text-[12px] font-bold whitespace-nowrap transition-colors border",
                            nameFilter === null
                              ? "bg-[#FFF1E8] text-[#FF4D00] border-[#FF4D00]"
                              : "bg-[#FFFFFF] text-[#555555] border-[#E8E8E8] hover:bg-[#F9F9F9]"
                          )}
                        >
                          All ({filteredItems.length})
                        </button>

                        {Array.from(new Set(filteredItems.map(i => i.name.split(" ")[0] + " " + (i.name.split(" ")[1] || ""))))
                          .slice(0, 5)
                          .map((name, idx) => (
                            <button
                              key={idx}
                              onClick={() => setNameFilter(nameFilter === name.trim() ? null : name.trim())}
                              className={cn("px-3.5 py-1.5 rounded-[20px] text-[11px] md:text-[12px] font-bold whitespace-nowrap transition-colors border",
                                nameFilter === name.trim()
                                  ? "bg-[#FFF1E8] text-[#FF4D00] border-[#FF4D00]"
                                  : "bg-[#FFFFFF] text-[#555555] border-[#E8E8E8] hover:bg-[#F9F9F9] shadow-sm"
                              )}
                            >
                              {name.trim()} ({filteredItems.filter(i => i.name.includes(name.trim())).length})
                            </button>
                          ))}
                      </div>
                    </>
                  )}

                  {filteredItems.length === 0 ? (
                    <div className="bg-[#FFFFFF] rounded-[26px] p-8 md:p-12 text-center border border-[#eef1f5] shadow-[0_10px_28px_rgba(15,23,42,0.05)] flex flex-col items-center">
                      <Search className="w-10 md:w-12 h-10 md:h-12 text-[#DDDDDD] mb-3 md:mb-4" />
                      <h3 className="text-[16px] md:text-[18px] font-bold text-[#171717]">No dishes found</h3>
                      <p className="text-[#555555] mt-1.5 md:mt-2 text-[13px] md:text-[14px] font-medium">Try selecting a different category or adjusting filters.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 2xl:grid-cols-2 gap-3 md:gap-4">
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

                  {activeCategory === "Recommended" && !showFullMenu && filteredItems.length > 0 && (
                    <button
                      onClick={() => setShowFullMenu(true)}
                      className="w-full mt-4 md:mt-6 h-10 md:h-12 rounded-[10px] border border-[#FF4D00] text-[#FF4D00] hover:bg-[#FFF1E8] font-bold text-[12px] md:text-[13px] uppercase tracking-wider bg-[#FFFFFF] transition-colors cursor-pointer shadow-sm"
                    >
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
                <div className="bg-[#FFFFFF] rounded-[26px] p-6 md:p-8 shadow-[0_10px_28px_rgba(15,23,42,0.05)] border border-[#eef1f5] flex items-center justify-center min-h-[300px] md:min-h-[400px]">
                  <p className="text-[#555555] font-medium">This section is currently being updated.</p>
                </div>
              )}
            </Suspense>
          </div>

          {activeTab === "menu" && (
            <div className="hidden xl:flex w-[280px] shrink-0 flex-col gap-4">
              {renderSidebarCards()}
            </div>
          )}
        </div>
      </div>

      <div className="lg:hidden px-4 md:px-6 pb-4">
        {renderSidebarCards()}
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
