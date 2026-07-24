"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartActions, useCartItems } from "@/stores";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Search, Star, Coffee, UtensilsCrossed, Pizza, Moon, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AddToCartPopup, type AddPopupItem } from "@/components/menu/add-to-cart-popup";
import { RelatedKitchensCarousel } from "@/components/kitchen/related-kitchens-carousel";
import { KitchenAboutSection } from "@/components/kitchen/kitchen-about-section";
import { CompoundMenuCard, VegIcon, NonVegIcon, type MenuCardItem } from "@/components/patterns/compound-menu-card";
import { KitchenTimingDisplay, getKitchenStatus, type OperatingHours } from "@/components/kitchen/kitchen-timing-display";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { RelatedKitchen } from "@/actions/catalog/home-data";

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

interface KitchenDetail {
  id: string;
  slug: string;
  displayName: string;
  avgRating: number | null;
  totalReviews: number;
  imageUrl: string | null;
  cuisineTags: string[];
  items: KitchenItem[];
  operatingHours: OperatingHours | null;
  costForTwo?: string;
}

interface Props {
  kitchen: KitchenDetail;
  initialTimeSlot: string | null;
  initialSearchQuery?: string | null;
  relatedKitchens?: RelatedKitchen[];
}

const SLOT_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  MORNING: { label: "Breakfast", icon: Coffee },
  LUNCH: { label: "Lunch", icon: UtensilsCrossed },
  EVENINGSNACKS: { label: "Snacks", icon: Pizza },
  DINNER: { label: "Dinner", icon: Moon },
};

const SLOT_ORDER = ["MORNING", "LUNCH", "EVENINGSNACKS", "DINNER"];

export function KitchenDetailClient({ kitchen, initialSearchQuery, relatedKitchens }: Props) {
  const router = useRouter();
  const { addToCart } = useCartActions();
  const cartItems = useCartItems();
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery ?? "");
  const [foodTypeFilter, setFoodTypeFilter] = useState<string | null>(null);
  const [bestsellerFilter, setBestsellerFilter] = useState(false);
  const [popupItem, setPopupItem] = useState<AddPopupItem | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);

  // Refs for scroll-based sticky navbar phases
  const heroNameRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const [stickyPhase, setStickyPhase] = useState<"none" | "name" | "search">("none");

  useEffect(() => {
    const heroEl = heroNameRef.current;
    const searchEl = searchBarRef.current;
    if (!heroEl || !searchEl) return;

    let heroVisible = true;
    let searchVisible = true;

    const updatePhase = () => {
      if (heroVisible) {
        setStickyPhase("none");
      } else if (!heroVisible && searchVisible) {
        setStickyPhase("name");
      } else {
        setStickyPhase("search");
      }
    };

    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        heroVisible = entry.isIntersecting;
        updatePhase();
      },
      { threshold: 0, rootMargin: "0px" }
    );

    const searchObserver = new IntersectionObserver(
      ([entry]) => {
        searchVisible = entry.isIntersecting;
        updatePhase();
      },
      { threshold: 0, rootMargin: "0px" }
    );

    heroObserver.observe(heroEl);
    searchObserver.observe(searchEl);

    return () => {
      heroObserver.disconnect();
      searchObserver.disconnect();
    };
  }, []);

  const bestSellers = useMemo(() => {
    return [...kitchen.items]
      .filter((i) => i.isBestseller || (i.orderCount ?? 0) > 0)
      .sort((a, b) => (b.orderCount ?? 0) - (a.orderCount ?? 0))
      .slice(0, 5)
      .map((i) => ({ name: i.name, description: i.description, orderCount: i.orderCount ?? 0 }));
  }, [kitchen.items]);

  const { groupedItems, highlightedItems } = useMemo(() => {
    let items = kitchen.items;
    if (foodTypeFilter) {
      items = items.filter((i) => i.foodType === foodTypeFilter);
    }
    if (bestsellerFilter) {
      items = items.filter((i) => i.isBestseller);
    }

    const q = searchQuery.trim().toLowerCase();
    const matched = q ? items.filter((i) => i.name.toLowerCase().includes(q)) : [];
    const remaining = q ? items.filter((i) => !i.name.toLowerCase().includes(q)) : items;

    const groups: Record<string, KitchenItem[]> = {};
    for (const slot of SLOT_ORDER) {
      const slotFiltered = remaining.filter((i) => i.timeSlot === slot);
      if (slotFiltered.length > 0) groups[slot] = slotFiltered;
    }

    return { 
      groupedItems: groups, 
      highlightedItems: matched, 
    };
  }, [kitchen.items, searchQuery, foodTypeFilter, bestsellerFilter]);

  const status = useMemo(() => getKitchenStatus(kitchen.operatingHours ?? null), [kitchen.operatingHours]);

  const handleShowAddPopup = useCallback(
    (menuItem: { id: string; name: string; price: number; compareAtPrice?: number | null; foodType: string; imageUrl?: string | null; kitchenName: string; timeSlot: string }) => {
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
    [cartItems, addToCart],
  );

  return (
    <main className="min-h-screen bg-white text-foreground pb-20">
      {/* ===== STICKY NAVBAR (Two-phase: name+timing → search+filters) ===== */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          stickyPhase === "none"
            ? "opacity-0 -translate-y-full pointer-events-none"
            : "opacity-100 translate-y-0"
        )}
      >
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-4xl mx-auto px-4">
            {/* Phase 1: Kitchen name + timing */}
            <div
              className={cn(
                "transition-all duration-300 overflow-hidden",
                stickyPhase === "name" ? "max-h-24 opacity-100 py-3" : "max-h-0 opacity-0 py-0"
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[15px] font-black text-foreground tracking-tight leading-tight truncate">
                    {kitchen.displayName}
                  </h2>
                  <div className="flex items-center gap-0 mt-0.5">
                    {status.isOpen ? (
                      <span className="text-[12px] font-bold text-[#3AB757]">Open now</span>
                    ) : (
                      <span className="text-[12px] font-bold text-[#E23744]">Closed</span>
                    )}
                    <span className="text-[#93959f] text-[12px] mx-1.5">·</span>
                    <span className="text-[12px] font-normal text-[#93959f]">
                      {status.isOpen && status.closeTime
                        ? `Closes ${status.closeTime}`
                        : status.opensNextAt
                          ? `Opens ${status.opensNextAt.time}`
                          : "See timings"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-all">
                    <Share2 className="h-4 w-4 text-foreground/80" />
                  </button>
                  <button className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-all">
                    <Search className="h-4 w-4 text-foreground/80" />
                  </button>
                </div>
              </div>
            </div>

            {/* Phase 2: Search bar + filters */}
            <div
              className={cn(
                "transition-all duration-300 overflow-hidden",
                stickyPhase === "search" ? "max-h-40 opacity-100 py-3" : "max-h-0 opacity-0 py-0"
              )}
            >
              <div className="space-y-3">
                <div className="relative w-full">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search for dishes"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-100/80 border-none rounded-xl h-11 text-center text-[15px] font-bold placeholder:text-muted-foreground/70 focus-visible:ring-0 shadow-none"
                  />
                </div>
                <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    onClick={() => setFoodTypeFilter(foodTypeFilter === "VEG" ? null : "VEG")}
                    className={cn(
                      "flex items-center gap-1.5 rounded-3xl px-3 py-1.5 border transition-all shrink-0 text-[13px] font-extrabold",
                      foodTypeFilter === "VEG" ? "border-success shadow-sm bg-success/5" : "border-gray-200 text-foreground"
                    )}
                  >
                    <VegIcon className="h-3.5 w-3.5" />
                    Veg
                  </button>
                  <button
                    onClick={() => setFoodTypeFilter(foodTypeFilter === "NONVEG" ? null : "NONVEG")}
                    className={cn(
                      "flex items-center gap-1.5 rounded-3xl px-3 py-1.5 border transition-all shrink-0 text-[13px] font-extrabold",
                      foodTypeFilter === "NONVEG" ? "border-destructive shadow-sm bg-destructive/5" : "border-gray-200 text-foreground"
                    )}
                  >
                    <NonVegIcon className="h-3.5 w-3.5" />
                    Non Veg
                  </button>
                  <button
                    onClick={() => setBestsellerFilter(!bestsellerFilter)}
                    className={cn(
                      "rounded-3xl px-4 py-1.5 text-[13px] font-extrabold border transition-all shrink-0",
                      bestsellerFilter ? "border-[#EE7005] text-[#EE7005] shadow-sm bg-[#EE7005]/5" : "border-gray-200 text-foreground"
                    )}
                  >
                    Bestseller
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== HERO SECTION ===== */}
      <section className="max-w-4xl mx-auto pt-4 px-4">
         <div ref={heroNameRef} className="flex items-start justify-between mb-4">
            <div>
               <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-none">
                  {kitchen.displayName}
               </h1>
               {!status.isOpen && (
                  <p className="text-[#E23744] text-sm font-semibold mt-1">Closed for delivery</p>
               )}
            </div>
            <div className="flex items-center gap-3">
               <button className="h-9 w-9 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-all">
                  <Share2 className="h-4.5 w-4.5 text-foreground/80" />
               </button>
               <button className="h-9 w-9 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-all">
                  <Search className="h-4.5 w-4.5 text-foreground/80" />
               </button>
            </div>
         </div>

         <div className="relative aspect-16/7 sm:aspect-16/6 w-full rounded-2xl overflow-hidden bg-muted">
            {kitchen.imageUrl ? (
               <Image src={kitchen.imageUrl} alt={kitchen.displayName} fill className="object-cover" priority />
            ) : (
               <div className="h-full w-full bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <UtensilsCrossed className="h-14 w-14 text-primary/20" />
               </div>
            )}
         </div>

         {!status.isOpen && status.opensNextAt && (
            <div className="mt-4 bg-orange-50 text-[#EE7005] p-3.5 rounded-xl text-[13px] font-bold flex gap-3 items-start border border-orange-100/50">
               <div className="h-5 w-5 rounded-full bg-[#EE7005] text-white flex items-center justify-center shrink-0 mt-0.5 font-serif text-xs italic">i</div>
               <p>
                  Uh-oh! Outlet is not accepting orders at the moment. They should be back by {status.opensNextAt.time} {status.opensNextAt.day.toLowerCase()}
               </p>
            </div>
         )}

         <div className="mt-4 px-1">
            <div className="flex items-center flex-wrap gap-1.5 text-[15px] font-extrabold text-foreground">
               <div className="flex items-center justify-center h-4.5 w-4.5 rounded-full bg-success text-white shadow-sm">
                  <Star className="h-2.5 w-2.5 fill-white" />
               </div>
               <span>{kitchen.avgRating?.toFixed(1) ?? "4.3"} ({kitchen.totalReviews}+ ratings)</span>
               <span className="opacity-40 text-lg font-normal mx-0.5">•</span>
               <span>₹{kitchen.costForTwo ?? "400"} for two</span>
            </div>
            
            <div className="mt-1 text-[14px] font-bold text-[#EE7005] hover:text-[#EE7005]/80 cursor-pointer transition-colors inline-block underline decoration-2 underline-offset-4">
               {kitchen.cuisineTags.join(", ")}
            </div>
            
            <div className="mt-2">
               <KitchenTimingDisplay operatingHours={kitchen.operatingHours} />
            </div>
         </div>

         <div className="mt-6 h-px bg-gray-100" />
      </section>

      {/* ===== INLINE SEARCH BAR (observed for phase 2 trigger) ===== */}
      <div ref={searchBarRef} className="max-w-4xl mx-auto px-4 py-3 space-y-3">
         <div className="relative w-full">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for dishes"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100/80 border-none rounded-xl h-12 text-center text-[15px] font-bold placeholder:text-muted-foreground/70 focus-visible:ring-0 shadow-none"
            />
         </div>
         
         <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
            <button
               onClick={() => setFoodTypeFilter(foodTypeFilter === "VEG" ? null : "VEG")}
               className={cn(
                 "flex items-center gap-1.5 rounded-3xl px-3 py-1.5 border transition-all shrink-0 text-[14px] font-extrabold",
                 foodTypeFilter === "VEG" ? "border-success shadow-sm bg-success/5" : "border-gray-200 text-foreground"
               )}
            >
               <VegIcon className="h-3.5 w-3.5" />
               Veg
            </button>

            <button
               onClick={() => setFoodTypeFilter(foodTypeFilter === "NONVEG" ? null : "NONVEG")}
               className={cn(
                 "flex items-center gap-1.5 rounded-3xl px-3 py-1.5 border transition-all shrink-0 text-[14px] font-extrabold",
                 foodTypeFilter === "NONVEG" ? "border-destructive shadow-sm bg-destructive/5" : "border-gray-200 text-foreground"
               )}
            >
               <NonVegIcon className="h-3.5 w-3.5" />
               Non Veg
            </button>

            <button
               onClick={() => setBestsellerFilter(!bestsellerFilter)}
               className={cn(
                 "rounded-3xl px-4 py-1.5 text-[14px] font-extrabold border transition-all shrink-0",
                 bestsellerFilter ? "border-[#EE7005] text-[#EE7005] shadow-sm bg-[#EE7005]/5" : "border-gray-200 text-foreground"
               )}
            >
               Bestseller
            </button>
         </div>
      </div>

      {/* ===== MENU ACCORDION SECTION ===== */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        {!Object.keys(groupedItems).length && !highlightedItems.length ? (
          <div className="flex flex-col items-center justify-center py-28 text-center bg-gray-50/50 rounded-[32px] border border-dashed border-gray-200/50">
            <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center shadow-sm mb-6">
               <Search className="h-10 w-10 text-muted-foreground/20" />
            </div>
            <p className="text-xl font-black text-foreground">No dishes found</p>
            <p className="text-sm font-bold text-muted-foreground/60 mt-2 max-w-60">We couldn&apos;t find any dishes matching your current selection.</p>
            <Button variant="ghost" onClick={() => { setSearchQuery(""); setFoodTypeFilter(null); setBestsellerFilter(false); }} className="mt-6 text-primary font-black text-xs hover:bg-primary/5 uppercase tracking-widest">Clear All Filters</Button>
          </div>
        ) : (
          <Accordion type="multiple" defaultValue={SLOT_ORDER} className="space-y-12">
            {SLOT_ORDER.map((slotKey) => {
               const config = SLOT_CONFIG[slotKey];
               const items = groupedItems[slotKey];
               if (!items) return null;
               
               return (
                 <AccordionItem key={slotKey} value={slotKey} className="border-none">
                    <AccordionTrigger className="hover:no-underline py-5 group/trigger transition-all">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-[#EE7005]/10 flex items-center justify-center text-[#EE7005] group-hover/trigger:scale-110 transition-transform duration-300">
                             <config.icon className="h-5 w-5" />
                          </div>
                          <div className="text-left">
                              <h2 className="text-xl font-black text-foreground tracking-tight leading-none">{config.label} ({items.length})</h2>
                          </div>
                       </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 pb-12">
                       <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
{items.map((item) => (
                              <CompoundMenuCard.Root
                                key={item.id}
                                item={item as unknown as MenuCardItem}
                                onItemClick={() => router.push(`/menu/${kitchen.slug}/${item.slug}-${item.shortId}`)}
                                onShowAddPopup={handleShowAddPopup as unknown as (item: MenuCardItem) => void}
                                showKitchenMeta={false}
                              >
                                 <CompoundMenuCard.ImageSection />
                                 <CompoundMenuCard.Header />
                              </CompoundMenuCard.Root>
                           ))}
                       </div>
                    </AccordionContent>
                    <div className="h-4 bg-gray-50/50 -mx-4 border-y border-gray-100/30" />
                 </AccordionItem>
               );
            })}
          </Accordion>
        )}

        {/* About Section */}
        <section className="mt-16 bg-gray-50/30 rounded-[32px] p-2 border border-gray-100/50">
          <KitchenAboutSection
            displayName={kitchen.displayName}
            cuisineTags={kitchen.cuisineTags}
            bestSellers={bestSellers}
          />
        </section>

        {/* Related Kitchens */}
        {relatedKitchens && relatedKitchens.length > 0 && (
          <section className="mt-16 pt-10 border-t border-gray-100">
            <RelatedKitchensCarousel
              kitchenName={kitchen.displayName}
              kitchens={relatedKitchens}
            />
          </section>
        )}
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


