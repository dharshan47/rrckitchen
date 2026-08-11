"use client";

import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, CheckCircle2, ChevronRight, Minus, Plus, ShoppingBag, Sparkles, Truck, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCartConfig } from "@/actions/cart-checkout/config";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAblyOrderChannel } from "@/hooks/useAblySubscribe";
import { useCartActions, useCartCount, useCartItems, useCartTotal, useCravingsRecommendationsQuery } from "@/stores";

export interface AddPopupItem {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  foodType: string;
  imageUrl?: string | null;
  kitchenName: string;
  timeSlot: string;
  isBestseller?: boolean;
}

interface AddToCartPopupProps {
  item: AddPopupItem | null;
  qty?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, the popup subscribes to this order's Ably channel for real-time cravings recommendations. */
  orderId?: string;
}

/** Item shape pushed by the backend over the `order:cravings` Ably event. */
interface LiveCravingItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  foodType?: string;
  prepTime?: string;
  tag?: string;
  bestseller?: boolean;
  image?: string;
  kitchenName?: string;
  timeSlot?: string;
  imageUrl?: string;
}

interface LiveCravings {
  title?: string;
  message?: string;
  items: LiveCravingItem[];
}

/** Unified recommendation card shape used for rendering. */
interface DisplayRecommendation {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  foodType?: string | null;
  kitchenName?: string;
  timeSlot: string;
  imageUrl?: string | null;
  isBestseller?: boolean;
}

export function AddToCartPopup({ item, qty = 1, open, onOpenChange, orderId }: AddToCartPopupProps) {
  const router = useRouter();
  const cartItems = useCartItems();
  const cartTotal = useCartTotal();
  const cartCount = useCartCount();
  const { updateQuantity, removeFromCart, addToCart } = useCartActions();
  const [liveCravings, setLiveCravings] = useState<LiveCravings | null>(null);

  // Real free-delivery threshold fetched from backend config via TanStack Query
  const { data: cartConfig } = useQuery({
    queryKey: ["cart-config"],
    queryFn: getCartConfig,
    staleTime: 5 * 60 * 1000,
  });

  // Cravings popup rules fetched from the backend for the items in the cart
  const triggerItemIds = item ? Array.from(new Set([item.id, ...cartItems.map((ci) => ci.id)])) : [];
  const { data: cravings, isFetching: cravingsLoading } = useCravingsRecommendationsQuery(triggerItemIds);

  // Real-time cravings pushed by the backend over the order's Ably channel
  useAblyOrderChannel(
    orderId,
    useCallback(
      (msg: { name: string; data: unknown }) => {
        if (msg.name === "order:cravings") {
          const data = msg.data as { items?: LiveCravingItem[]; message?: string; title?: string };
          setLiveCravings({
            title: data.title,
            message: data.message,
            items: data.items ?? [],
          });
        }
      },
      []
    ),
    Boolean(orderId) && open
  );

  const freeDeliveryThreshold = cartConfig?.freeDeliveryMin ?? 299;
  const amountAwayFromFreeDelivery = Math.max(0, freeDeliveryThreshold - cartTotal);
  const progressPercentage = Math.min(100, Math.round((cartTotal / freeDeliveryThreshold) * 100));
  const liveQty = item ? (cartItems.find((ci) => ci.id === item.id)?.qty ?? qty) : qty;

  if (!item) return null;

  const isVeg = item.foodType.toUpperCase() === "VEG";

  const handleQtyChange = (delta: number) => {
    const newQty = liveQty + delta;
    if (newQty < 1) {
      removeFromCart(item.id);
      onOpenChange(false);
    } else {
      updateQuantity(item.id, newQty);
    }
  };

  const handleAddRecommended = (rec: DisplayRecommendation) => {
    addToCart({
      id: rec.id,
      name: rec.name,
      price: rec.price,
      qty: 1,
      foodType: rec.foodType ?? item.foodType,
      timeSlot: rec.timeSlot || item.timeSlot,
      kitchenName: rec.kitchenName || item.kitchenName,
      imageUrl: rec.imageUrl ?? undefined,
    });
  };

  const goToCart = () => {
    onOpenChange(false);
    router.push("/cart");
  };

  // Merge live (Ably) recommendations with rule-based (backend) ones
  const displayRecommendations: DisplayRecommendation[] = [
    ...(liveCravings?.items ?? []).map((rec) => ({
      id: rec.id,
      name: rec.name,
      price: rec.price,
      compareAtPrice: rec.originalPrice ?? null,
      foodType:
        rec.foodType?.toUpperCase() === "VEG" || rec.foodType?.toUpperCase() === "NONVEG"
          ? rec.foodType.toUpperCase()
          : null,
      kitchenName: rec.kitchenName ?? "",
      timeSlot: rec.timeSlot ?? item.timeSlot,
      imageUrl: rec.image ?? rec.imageUrl ?? null,
      isBestseller: rec.bestseller ?? false,
    })),
    ...(cravings?.items ?? []).map((rec) => ({
      id: rec.menuItemId,
      name: rec.name,
      price: rec.price,
      compareAtPrice: rec.compareAtPrice ?? null,
      foodType: rec.foodType,
      kitchenName: rec.kitchenName,
      timeSlot: rec.timeSlot,
      imageUrl: rec.imageUrl ?? null,
      isBestseller: rec.isBestseller ?? false,
    })),
  ];

  const showRecommendations = displayRecommendations.length > 0;
  const recommendationsTitle = liveCravings?.title || cravings?.title;
  const recommendationsMessage = liveCravings?.message || cravings?.message;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[95vw] max-w-[420px] gap-0 overflow-hidden rounded-[24px] border-0 p-0 shadow-2xl sm:w-full"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
          className="absolute top-4 right-4 z-20 rounded-full bg-white/80 backdrop-blur-sm p-2 text-gray-400 shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col max-h-[85vh]">
          <div className="overflow-y-auto flex-1 p-5 md:p-8 pb-2 md:pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Header / Success Icon */}
          <DialogHeader className="mb-6 mt-2 items-center text-center">
            <div className="relative mb-3 flex items-center justify-center">
              <Sparkles className="absolute -top-1 -left-2 h-4 w-4 text-yellow-400 opacity-80" />
              <Sparkles className="absolute -bottom-1 -right-2 h-3 w-3 text-yellow-400 opacity-80" />
              <Sparkles className="absolute top-1 -right-3 h-4 w-4 text-yellow-400 opacity-80" />

              <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-green-100 bg-green-50">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-6 w-6 fill-green-100 text-green-600" />
                </div>
              </div>
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900 md:text-2xl">
              Added to Cart!
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-gray-500 md:text-[15px]">
              {item.name} has been added to your cart.
            </DialogDescription>
          </DialogHeader>

          {/* Item Card */}
          <div className="relative mb-6 flex items-center gap-3 rounded-[16px] border border-gray-100 bg-white p-3 shadow-sm md:gap-4">
            <div className="relative flex h-18 w-18 shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-orange-50">
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
              ) : (
                <ShoppingBag className="h-8 w-8 text-orange-200" />
              )}
              {item.isBestseller && (
                <div className="absolute bottom-0 left-0 z-10 rounded-tr-[8px] bg-[#008000] px-1.5 py-0.5 text-[9px] font-bold text-white">
                  Bestseller
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 py-1">
              <div className="mb-1.5 flex items-center gap-1.5">
                <h3 className="truncate text-sm font-bold text-gray-900 md:text-[15px]">{item.name}</h3>
                <div
                  role="img"
                  aria-label={isVeg ? "Veg" : "Non-Veg"}
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border p-px",
                    isVeg ? "border-[#168233]" : "border-red-600"
                  )}
                >
                  <div
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      isVeg ? "bg-[#168846]" : "bg-red-600"
                    )}
                  />
                </div>
              </div>
              <div className="text-base font-extrabold text-[#008000] md:text-lg">
                ₹{item.price}
              </div>
              {item.compareAtPrice && item.compareAtPrice > item.price && (
                <div className="text-xs font-medium text-gray-400 line-through">
                  ₹{item.compareAtPrice}
                </div>
              )}
            </div>

            {/* Qty controls */}
            <div className="flex h-9 shrink-0 items-center rounded-[8px] border border-gray-200 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => handleQtyChange(-1)}
                aria-label="Decrease quantity"
                className="flex h-full w-8 items-center justify-center rounded-l-[8px] text-[#EE7005] transition-colors hover:bg-orange-50"
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="w-8 text-center text-sm font-bold text-gray-900">{liveQty}</div>
              <button
                type="button"
                onClick={() => handleQtyChange(1)}
                aria-label="Increase quantity"
                className="flex h-full w-8 items-center justify-center rounded-r-[8px] text-[#EE7005] transition-colors hover:bg-orange-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="mb-6 rounded-[16px] border border-gray-100 bg-gray-50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-[14px] font-bold text-gray-900">Cart Summary</h4>
              <Link
                href="/cart"
                onClick={() => onOpenChange(false)}
                className="inline-flex items-center gap-0.5 text-[13px] font-bold text-[#EE7005] hover:underline"
              >
                View Cart ({cartCount} item{cartCount !== 1 ? "s" : ""})
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2 text-gray-600">
                  <ShoppingBag className="h-4 w-4" />
                  <span>
                    Subtotal ({cartCount} item{cartCount !== 1 ? "s" : ""})
                  </span>
                </div>
                <span className="text-[14px] font-extrabold text-gray-900">₹{cartTotal}</span>
              </div>

              <div className="pt-1">
                <div className="flex items-start justify-between gap-2 text-[13px]">
                  <div className="flex items-start gap-2 text-gray-600">
                    <Truck className="mt-0.5 h-4 w-4 shrink-0" />
                    {amountAwayFromFreeDelivery > 0 ? (
                      <span className="leading-tight">
                        You are{" "}
                        <span className="font-extrabold text-gray-900">
                          ₹{amountAwayFromFreeDelivery}
                        </span>{" "}
                        away from FREE delivery!
                      </span>
                    ) : (
                      <span className="font-semibold leading-tight text-[#008000]">
                        You have unlocked FREE delivery!
                      </span>
                    )}
                  </div>
                  <span className="shrink-0 text-[14px] font-extrabold text-gray-900">
                    ₹{freeDeliveryThreshold}
                  </span>
                </div>

                <Progress
                  value={progressPercentage}
                  className="mt-3 h-1.5 rounded-full bg-gray-200 [&_[data-slot=progress-indicator]]:bg-[#008000]"
                />
              </div>
            </div>
          </div>

          {/* Cravings Recommendations Section */}
          {showRecommendations && (
            <div className="mb-6">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  {recommendationsTitle && (
                    <h3 className="flex items-center gap-1.5 text-[17px] font-extrabold text-gray-900">
                      <span className="text-red-500 text-xl leading-none">❤️</span> {recommendationsTitle}
                    </h3>
                  )}
                  {recommendationsMessage && (
                    <p className="mt-0.5 text-[13px] font-medium text-gray-500">
                      {recommendationsMessage}
                    </p>
                  )}
                </div>
                <button className="flex shrink-0 items-center gap-1.5 rounded-[8px] border border-orange-100 bg-orange-50/50 px-3 py-1.5 text-[12px] font-bold text-[#EE7005] transition-colors hover:bg-orange-50">
                  <CalendarCheck className="h-4 w-4" />
                  Pre-book for Tomorrow
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {cravingsLoading && cravings === undefined && liveCravings === null && (
                  <div className="flex flex-col gap-3">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="flex gap-3 rounded-[12px] border border-gray-100 bg-white p-2 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
                      >
                        <Skeleton className="h-[96px] w-[130px] shrink-0 rounded-[8px]" />
                        <div className="flex flex-1 flex-col justify-between py-1">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                          <Skeleton className="h-8 w-20 rounded-[6px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {displayRecommendations.map((rec, index) => {
                  const isVeg = rec.foodType?.toUpperCase() === "VEG";
                  return (
                    <div
                      key={rec.id}
                      className="flex gap-3 rounded-[12px] border border-gray-100 bg-white p-2 shadow-[0_2px_12px_rgba(0,0,0,0.04)] animate-in fade-in-0 slide-in-from-bottom-1 duration-300"
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      {/* Left: Image & Badge */}
                      <div className="relative h-[96px] w-[130px] shrink-0 overflow-hidden rounded-[8px] bg-orange-50">
                        {rec.imageUrl ? (
                          <Image src={rec.imageUrl} alt={rec.name} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ShoppingBag className="h-8 w-8 text-orange-200" />
                          </div>
                        )}
                        {rec.isBestseller && (
                          <div className="absolute bottom-0 left-0 z-10 rounded-tr-[8px] bg-[#008000] px-2 py-0.5 text-[10px] font-bold text-white">
                            Bestseller
                          </div>
                        )}
                      </div>

                      {/* Right: Info & Add Button */}
                      <div className="flex flex-1 flex-col justify-between py-1 pr-1">
                        <div>
                          <div className="flex items-start gap-1.5">
                            <h4 className="text-[15px] font-bold leading-tight text-gray-900">{rec.name}</h4>
                            {rec.foodType && (
                              <div
                                role="img"
                                aria-label={isVeg ? "Veg" : "Non-Veg"}
                                className={cn(
                                  "mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border p-px",
                                  isVeg ? "border-[#168233]" : "border-red-600"
                                )}
                              >
                                <div
                                  className={cn(
                                    "h-1.5 w-1.5 rounded-full",
                                    isVeg ? "bg-[#168846]" : "bg-red-600"
                                  )}
                                />
                              </div>
                            )}
                          </div>
                          {rec.kitchenName && (
                            <p className="mt-1 line-clamp-1 text-[12px] text-gray-500">
                              {rec.kitchenName}
                            </p>
                          )}
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <div>
                            <div className="text-[15px] font-extrabold text-[#008000]">
                              ₹{rec.price}
                            </div>
                            {rec.compareAtPrice && rec.compareAtPrice > rec.price && (
                              <div className="text-[11px] font-medium text-gray-400 line-through">
                                ₹{rec.compareAtPrice}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleAddRecommended(rec)}
                            className="flex h-[32px] items-center justify-center gap-2 rounded-[6px] border border-[#EE7005] bg-white px-3 text-[12px] font-extrabold text-[#EE7005] transition-colors hover:bg-orange-50"
                          >
                            <span>ADD</span> <Plus className="h-3.5 w-3.5 stroke-[3]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          </div>

          {/* Footer Buttons - Sticky at bottom */}
          <div className="flex flex-row gap-2 sm:gap-3 p-4 sm:p-5 md:p-8 pt-4 md:pt-5 border-t border-gray-100 bg-white flex-shrink-0">
            <Button
              variant="outline"
              size="lg"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-[12px] border-[#EE7005] py-3.5 px-2 sm:px-4 text-[12px] sm:text-[13px] font-bold uppercase tracking-wider text-[#EE7005] hover:bg-orange-50 truncate"
            >
              Continue
            </Button>
            <Button
              size="lg"
              onClick={goToCart}
              className="flex-1 rounded-[12px] bg-[#EE7005] py-3.5 px-2 sm:px-4 text-[12px] sm:text-[13px] font-bold uppercase tracking-wider text-white shadow-md shadow-[#EE7005]/20 hover:bg-[#EE7005] hover:brightness-110 truncate"
            >
              View Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}