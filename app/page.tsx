"use client";

import { useRef, useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Badge, Button, Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import { useCartStore, useMenuStore } from "@/stores";
import { ChevronLeft, ChevronRight, Coffee, UtensilsCrossed, Cookie, Moon } from "lucide-react";
import Link from "next/link";

interface MenuItemPhoto {
  id: string;
  imageUrl: string;
  sortOrder: number;
}

interface KitchenAlias {
  displayName: string;
}

interface KitchenPartner {
  kitchenAlias: KitchenAlias | null;
}

interface MenuRelation {
  kitchenPartner: KitchenPartner | null;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  foodType: string;
  timeSlot: string;
  isAvailable: boolean;
  menu: MenuRelation | null;
  photos: MenuItemPhoto[];
}

interface ApiResponseItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  foodType: string;
  timeSlot: string;
  isAvailable: boolean;
  menu: MenuRelation | null;
  photos: MenuItemPhoto[];
}

export default function Home() {
  const selectedFoodType = useMenuStore((s) => s.selectedFoodType);
  const selectedTimeSlot = useMenuStore((s) => s.selectedTimeSlot);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [detailImageIndex, setDetailImageIndex] = useState(0);

  const addToCart = useCartStore((s) => s.addToCart);

  const { data: items = [] } = useQuery<ApiResponseItem[]>({
    queryKey: ["home-menu", { tab: selectedFoodType, slot: selectedTimeSlot }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedFoodType !== "ALL") params.set("foodType", selectedFoodType);
      if (selectedTimeSlot !== "ALL") params.set("timeSlot", selectedTimeSlot);
      const res = await fetch(`/api/menu/tomorrow?${params}`);
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  const filteredItems = useMemo(() => {
    return items as MenuItem[];
  }, [items]);

  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: filteredItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 140,
    overscan: 5,
  });

  const handleItemClick = useCallback((item: MenuItem) => {
    setSelectedItem(item);
    setDetailImageIndex(0);
  }, []);

  const handlePrevImage = useCallback(() => {
    if (!selectedItem) return;
    setDetailImageIndex((i) => (i > 0 ? i - 1 : selectedItem.photos.length - 1));
  }, [selectedItem]);

  const handleNextImage = useCallback(() => {
    if (!selectedItem) return;
    setDetailImageIndex((i) => (i < selectedItem.photos.length - 1 ? i + 1 : 0));
  }, [selectedItem]);

  return (
    <>
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex max-w-7xl flex-col px-4 lg:px-8">
          {/* Meal Time Cards */}
          <section className="py-8 border-b border-border">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/menu?timeSlot=MORNING"
                className="flex flex-col items-center text-center gap-4 p-6 rounded-2xl hover:bg-muted/50 transition-colors"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <Coffee className="h-10 w-10" />
                </div>
                <h3 className="font-bold text-lg text-foreground">Breakfast</h3>
                <p className="text-sm text-muted-foreground leading-5 max-w-[200px]">
                  Fresh morning meals to start your day
                </p>
              </Link>
              <Link
                href="/menu?timeSlot=LUNCH"
                className="flex flex-col items-center text-center gap-4 p-6 rounded-2xl hover:bg-muted/50 transition-colors"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <UtensilsCrossed className="h-10 w-10" />
                </div>
                <h3 className="font-bold text-lg text-foreground">Lunch</h3>
                <p className="text-sm text-muted-foreground leading-5 max-w-[200px]">
                  Wholesome afternoon meals
                </p>
              </Link>
              <Link
                href="/menu?timeSlot=EVENINGSNACKS"
                className="flex flex-col items-center text-center gap-4 p-6 rounded-2xl hover:bg-muted/50 transition-colors"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                  <Cookie className="h-10 w-10" />
                </div>
                <h3 className="font-bold text-lg text-foreground">Snacks</h3>
                <p className="text-sm text-muted-foreground leading-5 max-w-[200px]">
                  Delicious evening treats
                </p>
              </Link>
              <Link
                href="/menu?timeSlot=DINNER"
                className="flex flex-col items-center text-center gap-4 p-6 rounded-2xl hover:bg-muted/50 transition-colors"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <Moon className="h-10 w-10" />
                </div>
                <h3 className="font-bold text-lg text-foreground">Dinner</h3>
                <p className="text-sm text-muted-foreground leading-5 max-w-[200px]">
                  Hearty home-cooked dinners
                </p>
              </Link>
            </div>
          </section>

          {/* Virtualized Menu List */}
          <div
            ref={parentRef}
            className="overflow-auto"
            style={{ height: "calc(100vh - 450px)", minHeight: "400px" }}
          >
            {filteredItems.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                No items found for this filter.
              </div>
            ) : (
              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {virtualizer.getVirtualItems().map((virtualItem) => {
                  const item = filteredItems[virtualItem.index];
                  return (
                    <div
                      key={virtualItem.key}
                      data-index={virtualItem.index}
                      ref={virtualizer.measureElement}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                    >
                      <div
                        className="flex items-center gap-4 px-4 py-3 border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => handleItemClick(item)}
                      >
                        {/* Image */}
                        <div className="h-20 w-20 shrink-0 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
                          {item.photos?.[0]?.imageUrl ? (
                            <img
                              src={item.photos[0].imageUrl}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl font-bold text-muted-foreground/30">
                              {item.name.charAt(0)}
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-foreground truncate">
                              {item.name}
                            </span>
                            <Badge
                              variant={item.foodType === "VEG" ? "secondary" : "destructive"}
                              className="shrink-0 text-[9px] px-1.5 py-0"
                            >
                              {item.foodType}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 mb-1.5">
                            {item.menu?.kitchenPartner?.kitchenAlias?.displayName ?? "Local kitchen"}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-base font-bold text-foreground">
                              ₹{Number(item.price).toFixed(0)}
                            </span>
                            <Button
                              size="sm"
                              className="rounded-full h-8 text-xs px-4"
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart({
                                  id: item.id,
                                  name: item.name,
                                  price: Number(item.price),
                                  qty: 1,
                                  foodType: item.foodType,
                                  timeSlot: item.timeSlot,
                                  kitchenName:
                                    item.menu?.kitchenPartner?.kitchenAlias?.displayName ??
                                    "Home kitchen",
                                });
                              }}
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-b border-border" />

          {/* How it works */}
          <section className="py-12">
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2 text-center">
              How RRC Kitchen Works
            </h2>
            <p className="text-sm text-muted-foreground mb-10 max-w-xl mx-auto text-center">
              RRC Kitchen connects home chefs with local food lovers. Order fresh home-cooked
              meals for next-day delivery.
            </p>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                  1
                </div>
                <h3 className="font-semibold text-foreground">Browse &amp; Filter</h3>
                <p className="text-sm text-muted-foreground leading-6 max-w-xs">
                  Explore tomorrow&apos;s menu by meal time. Filter by Veg or Non-Veg to find what you crave.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                  2
                </div>
                <h3 className="font-semibold text-foreground">Home Chefs Prepare</h3>
                <p className="text-sm text-muted-foreground leading-6 max-w-xs">
                  Verified kitchen partners cook fresh meals using quality ingredients.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                  3
                </div>
                <h3 className="font-semibold text-foreground">Order &amp; Pay</h3>
                <p className="text-sm text-muted-foreground leading-6 max-w-xs">
                  Add items to cart, confirm your address, and place your order before cutoff.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                  4
                </div>
                <h3 className="font-semibold text-foreground">Next-Day Delivery</h3>
                <p className="text-sm text-muted-foreground leading-6 max-w-xs">
                  Meals delivered fresh in your chosen time slot. Pay online or on pickup.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedItem}
        onOpenChange={(open) => {
          if (!open) setSelectedItem(null);
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedItem && (
            <>
              {/* Image Gallery */}
              <div className="relative h-56 rounded-xl bg-slate-100 overflow-hidden mb-4 group">
                {selectedItem.photos?.length > 0 ? (
                  <>
                    <img
                      src={selectedItem.photos[detailImageIndex]?.imageUrl}
                      alt={selectedItem.name}
                      className="h-full w-full object-cover"
                    />
                    {selectedItem.photos.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {selectedItem.photos.map((_, i) => (
                            <span
                              key={i}
                              className={`h-1.5 w-1.5 rounded-full ${
                                i === detailImageIndex ? "bg-white" : "bg-white/50"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <span className="text-6xl font-bold text-muted-foreground/20">
                      {selectedItem.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              <DialogHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <DialogTitle className="text-xl">{selectedItem.name}</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedItem.menu?.kitchenPartner?.kitchenAlias?.displayName ??
                        "Local kitchen"}
                    </p>
                  </div>
                  <Badge
                    variant={selectedItem.foodType === "VEG" ? "secondary" : "destructive"}
                    className="shrink-0"
                  >
                    {selectedItem.foodType}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <p className="text-sm leading-7 text-muted-foreground">
                  {selectedItem.description ??
                    "Freshly prepared home-cooked meal made with quality ingredients. Available for tomorrow delivery."}
                </p>

                <div className="flex items-center justify-between rounded-2xl bg-muted px-5 py-4">
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      ₹{Number(selectedItem.price).toFixed(0)}
                    </p>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
                      {selectedItem.timeSlot.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="rounded-full"
                    onClick={() => {
                      addToCart({
                        id: selectedItem.id,
                        name: selectedItem.name,
                        price: Number(selectedItem.price),
                        qty: 1,
                        foodType: selectedItem.foodType,
                        timeSlot: selectedItem.timeSlot,
                        kitchenName:
                          selectedItem.menu?.kitchenPartner?.kitchenAlias?.displayName ??
                          "Home kitchen",
                      });
                    }}
                  >
                    Add to Cart
                  </Button>
                </div>

                {selectedItem.photos?.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {selectedItem.photos.map((photo, i) => (
                      <button
                        key={photo.id}
                        onClick={() => setDetailImageIndex(i)}
                        className={`h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          i === detailImageIndex
                            ? "border-primary"
                            : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={photo.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
