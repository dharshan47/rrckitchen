"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartActions, useCartItems } from "@/stores";
import { CompoundMenuCard, VegIcon, NonVegIcon } from "@/components/patterns/compound-menu-card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import Image from "next/image";
import { Search, Star, ArrowLeft, Coffee, UtensilsCrossed, Pizza, Moon, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AddToCartPopup, type AddPopupItem } from "@/components/menu/add-to-cart-popup";
import { RelatedKitchensCarousel } from "@/components/kitchen/related-kitchens-carousel";
import { KitchenAboutSection } from "@/components/kitchen/kitchen-about-section";
import { KitchenTimingDisplay, type OperatingHours } from "@/components/kitchen/kitchen-timing-display";
import type { RelatedKitchen } from "@/actions/catalog/home-data";

interface KitchenItem {
  id: string;
  slug?: string;
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
}

interface KitchenDetail {
  id: string;
  displayName: string;
  avgRating: number | null;
  totalReviews: number;
  imageUrl: string | null;
  cuisineTags: string[];
  items: KitchenItem[];
  operatingHours: OperatingHours | null;
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

export function KitchenDetailClient({ kitchen, initialTimeSlot, initialSearchQuery, relatedKitchens }: Props) {
  const router = useRouter();
  const { addToCart } = useCartActions();
  const cartItems = useCartItems();
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery ?? "");
  const [foodTypeFilter, setFoodTypeFilter] = useState<string | null>(null);
  const [bestsellerFilter, setBestsellerFilter] = useState(false);
  const [popupItem, setPopupItem] = useState<AddPopupItem | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);

  const bestSellers = useMemo(() => {
    return [...kitchen.items]
      .filter((i) => i.isBestseller || (i.orderCount ?? 0) > 0)
      .sort((a, b) => (b.orderCount ?? 0) - (a.orderCount ?? 0))
      .slice(0, 5)
      .map((i) => ({ name: i.name, description: i.description, orderCount: i.orderCount ?? 0 }));
  }, [kitchen.items]);

  const hasBothTypes = useMemo(() => {
    const types = new Set(kitchen.items.map((i) => i.foodType));
    return types.has("VEG") && types.has("NONVEG");
  }, [kitchen.items]);

  const hasOnlyVeg = useMemo(() => {
    const types = new Set(kitchen.items.map((i) => i.foodType));
    return types.size === 1 && types.has("VEG");
  }, [kitchen.items]);

  const { groupedItems, highlightedItems } = useMemo(() => {
    let items = kitchen.items;
    if (initialTimeSlot && initialTimeSlot !== "ALL") {
      items = items.filter((i) => i.timeSlot === initialTimeSlot);
    }
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
      const filtered = remaining.filter((i) => i.timeSlot === slot);
      if (filtered.length > 0) groups[slot] = filtered;
    }
    return { groupedItems: groups, highlightedItems: matched };
  }, [kitchen.items, initialTimeSlot, searchQuery, foodTypeFilter, bestsellerFilter]);

  const hasGroups = Object.keys(groupedItems).length > 0 || highlightedItems.length > 0;

  const defaultOpen = useMemo(() => {
    const open = highlightedItems.length > 0 ? ["highlighted"] : []
    if (initialTimeSlot && initialTimeSlot !== "ALL") return [...open, initialTimeSlot]
    return [...open, ...SLOT_ORDER.filter((s) => groupedItems[s])]
  }, [initialTimeSlot, groupedItems, highlightedItems]);

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

  const handleItemClick = useCallback(
    (item: { id: string; slug?: string }) => {
      router.push(`/menu/${item.slug ?? item.id}`);
    },
    [router],
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-20 md:pb-8">
        {/* Back button - top left */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-muted-foreground -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Content: name -> image -> rating -> cuisine tags -> timing */}
        <div className="flex flex-col gap-3">
          {/* Kitchen Name */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">{kitchen.displayName}</h1>

          {/* Kitchen Image */}
          {kitchen.imageUrl && (
            <div className="relative w-full max-w-3xl aspect-video sm:aspect-16/7 rounded-lg overflow-hidden bg-muted">
              <Image
                src={kitchen.imageUrl}
                alt={kitchen.displayName}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1024px"
              />
            </div>
          )}

          {/* Rating */}
          {kitchen.avgRating != null && kitchen.avgRating > 0 && (
            <div className="flex items-center gap-1.5">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="text-lg font-bold">{kitchen.avgRating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                ({kitchen.totalReviews} {kitchen.totalReviews === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}

          {/* Cuisine Tags */}
          {kitchen.cuisineTags && kitchen.cuisineTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              {kitchen.cuisineTags.map((tag, i) => (
                <span key={tag}>
                  <Link
                    href={`/categories/${tag.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-primary hover:underline"
                  >
                    {tag}
                  </Link>
                  {i < kitchen.cuisineTags.length - 1 && <span className="text-primary ml-1">,</span>}
                </span>
              ))}
            </div>
          )}

          {/* Timing */}
          <KitchenTimingDisplay operatingHours={kitchen.operatingHours} />
        </div>

        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-nowrap md:flex-wrap items-center justify-start md:justify-center gap-2 overflow-x-auto scrollbar-none">
          {hasBothTypes ? (
            <>
              <button
                onClick={() => setFoodTypeFilter(foodTypeFilter === "VEG" ? null : "VEG")}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors border",
                  foodTypeFilter === "VEG"
                    ? "border-[#22C55E] bg-green-50 text-[#22C55E]"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <VegIcon className="h-3.5 w-3.5" />
                Veg
              </button>
              <button
                onClick={() => setFoodTypeFilter(foodTypeFilter === "NONVEG" ? null : "NONVEG")}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors border",
                  foodTypeFilter === "NONVEG"
                    ? "border-[#EF4444] bg-red-50 text-[#EF4444]"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <NonVegIcon className="h-3.5 w-3.5" />
                Non-Veg
              </button>
              <button
                onClick={() => setBestsellerFilter(!bestsellerFilter)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors border",
                  bestsellerFilter
                    ? "border-orange-500 bg-orange-500/10 text-orange-600"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <Flame className="h-3.5 w-3.5" />
                Bestseller
              </button>
            </>
          ) : hasOnlyVeg ? (
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border border-[#22C55E] bg-green-50 text-[#22C55E]">
              <VegIcon className="h-3.5 w-3.5" />
              Pure Veg
            </div>
          ) : null}
        </div>

        {!hasGroups ? (
          <p className="text-center text-sm text-muted-foreground py-12">
            {searchQuery
              ? "No menu items match your search."
              : "No menu items available."}
          </p>
        ) : (
          <div className="max-w-4xl mx-auto">
            <Accordion type="multiple" defaultValue={defaultOpen} className="max-w-4xl mx-auto">
              {highlightedItems.length > 0 && (
                <AccordionItem value="highlighted">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Search className="h-5 w-5 text-primary" />
                      <span className="text-base font-bold">Because you searched for &ldquo;{searchQuery}&rdquo;</span>
                      <span className="text-xs text-muted-foreground">
                        ({highlightedItems.length} {highlightedItems.length === 1 ? "item" : "items"})
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 pt-2">
                      {highlightedItems.map((item) => (
                        <CompoundMenuCard.Root
                          key={item.id}
                          item={{
                            id: item.id,
                            slug: item.slug,
                            name: item.name,
                            price: Number(item.price),
                            compareAtPrice: item.compareAtPrice,
                            foodType: item.foodType,
                            timeSlot: item.timeSlot,
                            kitchenName: item.kitchenName,
                            kitchenRating: kitchen.avgRating,
                            totalReviews: kitchen.totalReviews,
                            description: item.description,
                            imageUrl: item.imageUrl,
                            isBestseller: item.isBestseller,
                          }}
                          showKitchenMeta={false}
                          onShowAddPopup={handleShowAddPopup}
                          onItemClick={handleItemClick}
                        >
                          <CompoundMenuCard.ImageSection>
                            <CompoundMenuCard.BadgeRibbon />
                            <CompoundMenuCard.WishlistButton />
                          </CompoundMenuCard.ImageSection>
                          <CompoundMenuCard.Header />
                          <CompoundMenuCard.Footer />
                        </CompoundMenuCard.Root>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
              {SLOT_ORDER.map((slotKey) => {
                const config = SLOT_CONFIG[slotKey];
                const items = groupedItems[slotKey];
                if (!items) return null;

                return (
                  <AccordionItem key={slotKey} value={slotKey}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <config.icon className="h-5 w-5 text-primary" />
                        <span className="text-base font-bold">{config.label}</span>
                        <span className="text-xs text-muted-foreground">({items.length})</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 pt-2">
                        {items.map((item) => (
                          <CompoundMenuCard.Root
                            key={item.id}
                            item={{
                              id: item.id,
                              slug: item.slug,
                              name: item.name,
                              price: Number(item.price),
                              compareAtPrice: item.compareAtPrice,
                              foodType: item.foodType,
                              timeSlot: item.timeSlot,
                              kitchenName: item.kitchenName,
                              kitchenRating: kitchen.avgRating,
                              totalReviews: kitchen.totalReviews,
                              description: item.description,
                              imageUrl: item.imageUrl,
                              isBestseller: item.isBestseller,
                            }}
                            showKitchenMeta={false}
                            onShowAddPopup={handleShowAddPopup}
                            onItemClick={handleItemClick}
                          >
                            <CompoundMenuCard.ImageSection>
                              <CompoundMenuCard.BadgeRibbon />
                              <CompoundMenuCard.WishlistButton />
                            </CompoundMenuCard.ImageSection>
                            <CompoundMenuCard.Header />
                            <CompoundMenuCard.Footer />
                          </CompoundMenuCard.Root>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        )}

        {relatedKitchens && (
          <RelatedKitchensCarousel
            kitchenName={kitchen.displayName}
            kitchens={relatedKitchens}
          />
        )}

        <KitchenAboutSection
          displayName={kitchen.displayName}
          cuisineTags={kitchen.cuisineTags}
          bestSellers={bestSellers}
        />
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
