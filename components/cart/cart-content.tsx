"use client";

import { memo, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useOptimisticCart } from "@/hooks/useOptimisticCart";
import { useRazorpay } from "@/hooks/useRazorpay";
import { useSession } from "@/lib/auth-client";
import { useCartCoupon, useMenuDeliveryAddress, useCartActions } from "@/stores";
import {
  useCartAddressesQuery,
  useCartConfigQuery,
  useCartCouponsQuery,
  useCartAddresses,
  useCartConfig,
  useCartAvailableCoupons,
} from "@/stores/cartStore";
import { DeliveryAddressCard } from "@/components/cart/delivery-address-card";
import { useEventCallback } from "@/hooks/useStableReference";
import { getTimeSlotLabel, formatTimeSlot } from "@/lib/patterns";
import type { TimeSlotFilter } from "@/stores/menuStore";
import {
  Trash2, Minus, Plus, ShoppingBag,
  Loader2, Tag, Percent, ChevronRight,
  MapPin, Clock, Lock, ShieldCheck, Info,
  Home, Briefcase, MoreHorizontal,
  CheckCircle2, Calendar, X, Edit3,
} from "lucide-react";
import { toast } from "sonner";

import { AddToCartPopup, type AddPopupItem } from "@/components/menu/add-to-cart-popup";
import { CartSkeleton } from "@/components/cart/cart-skeleton";

const addressIconMap: Record<string, { icon: typeof Home; color: string }> = {
  Home: { icon: Home, color: "text-[#EE7005] bg-[#EE7005]/10" },
  Work: { icon: Briefcase, color: "text-gray-500 bg-gray-100" },
  Other: { icon: MoreHorizontal, color: "text-gray-500 bg-gray-100" },
};

const CartItemCard = memo(function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: { id: string; name: string; price: number; qty: number; foodType: string; timeSlot: string; kitchenName: string; imageUrl?: string };
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  const isVeg = item.foodType.toUpperCase() === "VEG";
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-3 sm:p-4 flex gap-3 sm:gap-4">
        <div className="relative h-18 w-18 sm:h-21 sm:w-21 shrink-0 rounded-xl bg-gray-50 overflow-hidden border border-gray-100">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              loading="lazy"
              className="object-cover"
              sizes="84px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-gray-300" />
            </div>
          )}
          {isVeg && (
            <div className="absolute bottom-1 left-1 bg-white/90 p-px rounded-sm shadow-sm">
               <div className="h-3 w-3 rounded-sm border border-[#168846] flex items-center justify-center p-px">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#168846]" />
               </div>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between min-w-0">

          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="font-bold text-[14px] sm:text-[15px] text-[#0A3D24] leading-tight truncate">{item.name}</h3>
                {isVeg && (
                  <div className="hidden sm:flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-sm border border-gray-200 shrink-0">
                    <div className="h-3 w-3 rounded-sm border border-[#168846] flex items-center justify-center p-px">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#168846]" />
                    </div>
                    <span className="text-[10px] font-black text-[#168846]">Pure Veg</span>
                  </div>
                )}
              </div>
              <span className="sm:hidden font-black text-[15px] text-[#0A3D24]">₹{item.price}</span>
            </div>

            <p className="text-[11px] font-bold text-gray-400 mt-0.5 line-clamp-1">{item.kitchenName}</p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 sm:mt-2.5">
               <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500">
                  <div className="h-4 w-4 flex items-center justify-center bg-gray-50 rounded-full border border-gray-200">
                     <Clock className="h-2.5 w-2.5" />
                  </div>
                  Meal Time: {item.timeSlot}
               </div>
            </div>
          </div>

          <div className="flex items-center justify-end sm:justify-start gap-4 mt-3 sm:mt-0 shrink-0 sm:pl-4">
             <span className="hidden sm:block font-black text-[16px] text-[#0A3D24] w-12 text-right">₹{item.price}</span>

             <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm h-8">
               <button onClick={() => onUpdateQuantity(item.id, item.qty - 1)} className="w-8 h-full flex items-center justify-center text-[#EE7005] hover:bg-gray-50 transition-colors">
                 <Minus className="h-3 w-3" />
               </button>
               <div className="w-8 h-full flex items-center justify-center border-x border-gray-200 text-[13px] font-bold text-[#0A3D24]">
                 {item.qty}
               </div>
               <button onClick={() => onUpdateQuantity(item.id, item.qty + 1)} className="w-8 h-full flex items-center justify-center text-[#EE7005] hover:bg-gray-50 transition-colors">
                 <Plus className="h-3 w-3" />
               </button>
             </div>

             <button onClick={() => onRemove(item.id)} className="h-8 w-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-md transition-colors border border-transparent hover:border-red-100">
               <Trash2 className="h-4 w-4" />
             </button>
          </div>
        </div>

      </div>
    </div>
  );
});

const PriceBreakdown = memo(function PriceBreakdown({
  itemCounts,
  total,
  couponSavings,
  finalTotal,
}: {
  itemCounts: number;
  total: number;
  couponSavings: number;
  finalTotal: number;
}) {
  return (
    <div>
      <h2 className="text-[16px] font-black text-[#0A3D24] mb-4">Order Summary</h2>
      <div className="space-y-3 text-[14px]">
        <div className="flex justify-between">
          <span className="text-gray-600 font-medium">Item Total ({itemCounts} Items)</span>
          <span className="font-bold text-gray-900">₹{total.toFixed(0)}</span>
        </div>
        {couponSavings > 0 && (
          <div className="flex justify-between text-[#168846]">
            <span className="font-medium">Coupon Savings</span>
            <span className="font-bold">-₹{couponSavings.toFixed(0)}</span>
          </div>
        )}
        <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
          <span className="text-[15px] font-black text-[#0A3D24]">Total Amount</span>
          <span className="text-[22px] font-black text-[#168846]">₹{finalTotal.toFixed(0)}</span>
        </div>
      </div>
      {couponSavings > 0 && (
        <div className="mt-3 flex items-center gap-2 bg-[#e8f5ed] rounded-lg px-3 py-2.5">
          <Tag className="h-4 w-4 text-[#168846]" />
          <span className="text-[12px] font-bold text-[#168846]">You Save ₹{couponSavings.toFixed(0)} on this order</span>
        </div>
      )}
    </div>
  );
});

export function CartContent() {
  const { cart, updateQuantity, removeFromCart, clearCart, total } = useOptimisticCart();
  const { initiateCheckout, isProcessing, paymentResult, resetPayment } = useRazorpay();
  const { data: session, isPending } = useSession();
  const deliveryAddress = useMenuDeliveryAddress();
  const appliedCoupon = useCartCoupon();
  const { removeCoupon } = useCartActions();
  const razorpayConfigured = !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  const [addressSheetOpen, setAddressSheetOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedDateType, setSelectedDateType] = useState<"TODAY" | "TOMORROW">("TOMORROW");
  const [cravingsOpen, setCravingsOpen] = useState(true);

  useEffect(() => {
    if (paymentResult && !paymentResult.success) {
      toast.error(paymentResult.error || "Payment failed. Please try again.");
    }
  }, [paymentResult]);

  const { isLoading: addressesLoading } = useCartAddressesQuery(!!session?.user);
  const { isLoading: cartConfigLoading } = useCartConfigQuery();
  useCartCouponsQuery(total);

  const addresses = useCartAddresses();
  const cartConfig = useCartConfig();
  const availableCoupons = useCartAvailableCoupons();

  const defaultAddress = useMemo(() => {
    if (selectedAddressId) return addresses.find(a => a.id === selectedAddressId) ?? null;
    return addresses.find(a => a.isDefault) ?? addresses[0] ?? null;
  }, [addresses, selectedAddressId]);

  const deliveryDateLabel = useMemo(() => {
    const d = new Date();
    if (selectedDateType === "TOMORROW") {
      d.setDate(d.getDate() + 1);
    }
    return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }, [selectedDateType]);

  const dateOptions = useMemo(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    return [
      {
        type: "TOMORROW" as const,
        label: tomorrow.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
      },
      {
        type: "TODAY" as const,
        label: today.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
        disabled: true,
      },
    ];
  }, []);

  const deliveryTimeSlot = useMemo(() => {
    if (cart.length === 0) return "";
    const slot = cart[0].timeSlot;
    const typedSlot = slot as TimeSlotFilter;
    return getTimeSlotLabel(typedSlot) || formatTimeSlot(slot);
  }, [cart]);

  const handleCheckout = useEventCallback(async () => {
    if (!deliveryAddress) {
      toast.error("Please select a delivery location before placing your order");
      return;
    }
    if (!razorpayConfigured) {
      toast.error("Online payment is not available.");
      return;
    }
    const phone = session?.user?.phoneNumber ?? "";
    await initiateCheckout(cart, total, phone, appliedCoupon?.code, selectedDateType);
  });

  if (paymentResult?.success) {
    const firstCartItem: AddPopupItem | null = cart[0]
      ? {
          id: cart[0].id,
          name: cart[0].name,
          price: cart[0].price,
          foodType: cart[0].foodType,
          imageUrl: cart[0].imageUrl ?? null,
          kitchenName: cart[0].kitchenName,
          timeSlot: cart[0].timeSlot,
          isBestseller: false,
        }
      : null;

    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 px-4 py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <ShoppingBag className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Order Placed!</h1>
            <p className="mt-2 text-sm text-muted-foreground">Your order has been placed successfully.</p>
            <p className="mt-1 text-xs text-muted-foreground font-mono">Order ID: {paymentResult.orderId}</p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline" onClick={resetPayment}>
              <Link href="/categories">Browse Categories</Link>
            </Button>
            <Button asChild onClick={resetPayment}>
              <Link href="/account/orders">View Orders</Link>
            </Button>
          </div>
        </div>
        {firstCartItem && paymentResult.orderId && (
          <AddToCartPopup
            item={firstCartItem}
            open={cravingsOpen}
            onOpenChange={setCravingsOpen}
            orderId={paymentResult.orderId}
          />
        )}
      </main>
    );
  }

  if (isPending || addressesLoading || cartConfigLoading) {
    return <CartSkeleton />;
  }

  if (!session?.user) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 px-4 py-24 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/40" />
          <div>
            <h1 className="text-2xl font-bold">Login to view cart</h1>
            <p className="mt-2 text-sm text-muted-foreground">Please log in to see your cart and place orders.</p>
          </div>
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 px-4 py-24 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/40" />
          <div>
            <h1 className="text-2xl font-bold">Your cart is empty</h1>
            <p className="mt-2 text-sm text-muted-foreground">Add items from the menu to get started.</p>
          </div>
          <Button asChild>
            <Link href="/categories">Browse Categories</Link>
          </Button>
        </div>
      </main>
    );
  }

  const couponSavings = appliedCoupon ? appliedCoupon.discount : 0;
  const finalTotal = Math.max(0, total - couponSavings);
  const itemCounts = cart.reduce((acc, item) => acc + item.qty, 0);

  const packagingCharge = cartConfig?.packagingCharge ?? 0;
  const deliveryCharge = cartConfig?.deliveryCharge ?? 0;
  const freeDeliveryMin = cartConfig?.freeDeliveryMin ?? 0;
  const effectiveDeliveryCharge = cartConfig && total >= freeDeliveryMin ? 0 : deliveryCharge;
  const effectiveTotal = finalTotal + packagingCharge + effectiveDeliveryCharge;

  return (
    <main className="min-h-screen bg-[#fcfbf9]">
      <div className="bg-[#FFF4E8] border-b border-[#EE7005]/20">
        <div className="max-w-300 mx-auto px-4 md:px-6 py-3 flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-[#EE7005]/10 flex items-center justify-center shrink-0 mt-0.5">
            <Info className="h-4 w-4 text-[#EE7005]" />
          </div>
          <div>
            <h3 className="text-[13px] font-black text-[#0A3D24]">Pre-Book Orders Only</h3>
            <p className="text-[11px] sm:text-[12px] text-gray-600 font-medium mt-0.5">All orders must be placed in advance. Same day delivery is not available.</p>
          </div>
        </div>
      </div>

      <div className="max-w-300 mx-auto px-4 md:px-6 py-6 pb-44 md:pb-10">
        <div className="flex flex-col lg:flex-row gap-8">

          <div className="flex-1 min-w-0 space-y-8">

            <div className="flex items-center justify-between">
              <h1 className="text-[18px] sm:text-[20px] font-black text-[#0A3D24]">
                Your Cart ({itemCounts} Items)
              </h1>
              <button onClick={clearCart} className="md:hidden flex items-center gap-1.5 text-[#EE7005] text-[12px] font-bold">
                Edit Cart <Edit3 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {cart.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))}
            </div>

            <div className="bg-[#FFF4E8] border border-[#EE7005]/20 rounded-xl px-4 py-3 flex items-start gap-3">
              <div className="mt-0.5">
                <span className="text-[12px] font-black text-[#EE7005]">Pre-Book Notice</span>
              </div>
              <p className="text-[11px] sm:text-[12px] text-gray-600 font-medium">
                You can only place orders in advance. Please select your preferred delivery date and time.
              </p>
            </div>

            <div>
              <h2 className="text-[15px] font-black text-[#0A3D24] mb-4">1. Select Delivery Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {addresses.length === 0 ? (
                  <div className="col-span-full text-center py-6 text-gray-500 text-sm font-medium">
                    No saved addresses. Please add one below.
                  </div>
                ) : (
                  addresses.map((addr) => {
                    const label = addr.label || "Other";
                    const iconInfo = addressIconMap[label] ?? addressIconMap.Other;
                    const Icon = iconInfo.icon;
                    const isSelected = defaultAddress?.id === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`relative rounded-xl p-4 cursor-pointer transition-colors ${
                          isSelected
                            ? "border-2 border-[#168846] bg-[#f7fdf9]"
                            : "border border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle2 className="h-5 w-5 text-[#168846] fill-[#168846] stroke-white" />
                          </div>
                        )}
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`h-8 w-8 rounded-lg ${iconInfo.color} flex items-center justify-center`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-[13px] font-black text-[#0A3D24]">{label}</p>
                            <p className="text-[10px] font-medium text-gray-500">{session.user?.name || ""}</p>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                          {addr.lineOne}{addr.lineTwo ? `, ${addr.lineTwo}` : ""}, {addr.pincode}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
              <button
                onClick={() => setAddressSheetOpen(true)}
                className="w-full mt-3 flex items-center justify-center gap-2 border border-dashed border-[#EE7005]/40 rounded-xl py-3 text-[13px] font-bold text-[#EE7005] hover:bg-[#EE7005]/5 transition-colors"
              >
                <Plus className="h-4 w-4" /> Add New Address
              </button>
            </div>

            <div>
              <h2 className="text-[15px] font-black text-[#0A3D24] mb-4">2. Select Delivery Date & Time (Pre-Book Only)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    {dateOptions.map((opt) => (
                      <button
                        key={opt.type}
                        disabled={opt.disabled}
                        onClick={() => setSelectedDateType(opt.type)}
                        className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-colors ${
                          selectedDateType === opt.type
                            ? "bg-[#168846] text-white border-2 border-[#168846]"
                            : "bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300"
                        } ${opt.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <Calendar className={`h-4 w-4 ${selectedDateType === opt.type ? "text-white" : "text-gray-500"}`} />
                        <span className="text-[12px] font-bold">{opt.label}</span>
                        {opt.disabled && <span className="text-[9px] font-medium opacity-60 ml-auto">Unavailable</span>}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] font-bold text-[#168846] px-1">{deliveryDateLabel}</p>
                </div>
                <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 bg-white">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-[13px] font-bold text-[#0A3D24]">{deliveryTimeSlot}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 rotate-90" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 bg-[#e8f5ed] rounded-lg px-3 py-2.5">
                <Info className="h-4 w-4 text-[#168846] shrink-0" />
                <span className="text-[11px] font-bold text-[#168846]">Orders for the same day are not accepted. Please choose a future date.</span>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-95 shrink-0">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <PriceBreakdown
                  itemCounts={itemCounts}
                  total={total}
                  couponSavings={couponSavings}
                  finalTotal={effectiveTotal}
                />
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <h2 className="text-[16px] font-black text-[#0A3D24] mb-4">Apply Coupon</h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#EE7005] focus:ring-1 focus:ring-[#EE7005]"
                  />
                  <button className="bg-[#EE7005] text-white px-5 py-2.5 rounded-lg text-[12px] font-black uppercase tracking-wider hover:bg-[#d66504] transition-colors shadow-sm">
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <div className="mt-3 flex items-center justify-between bg-[#e8f5ed] rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-black text-[#0A3D24]">{appliedCoupon.code}</span>
                      <span className="text-[11px] font-bold text-[#168846]">You saved ₹{appliedCoupon.discount}</span>
                    </div>
                    <button onClick={removeCoupon} className="text-red-500 hover:text-red-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <h2 className="text-[16px] font-black text-[#0A3D24] mb-4">Available Offers</h2>
                <div className="space-y-3">
                  {availableCoupons.length === 0 ? (
                    <p className="text-[12px] text-gray-500 font-medium text-center py-4">No offers available right now</p>
                  ) : (
                    availableCoupons.map((offer) => (
                      <div key={offer.code} className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#e8f5ed] flex items-center justify-center shrink-0 mt-0.5">
                          <Percent className="h-3.5 w-3.5 text-[#168846]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] text-gray-700 font-medium">{offer.description}</p>
                          <p className="text-[11px] font-black text-[#0A3D24] mt-0.5">{offer.code}</p>
                        </div>
                        <span className="text-[10px] font-bold text-[#EE7005] shrink-0">T&C</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <h2 className="text-[16px] font-black text-[#0A3D24] mb-4">Payment Method</h2>
                <div className="flex items-start gap-3 bg-[#e8f5ed] rounded-xl p-4">
                  <div className="h-8 w-8 rounded-full bg-[#168846] flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-black text-[#0A3D24]">Online Payment Only</p>
                    <p className="text-[11px] text-gray-600 font-medium mt-1">RRC Kitchen accepts only online payments for all pre-booked orders.</p>
                  </div>
                  <div className="shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-[#168846]" />
                  </div>
                </div>
              </div>

              <div className="hidden md:block">
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full bg-[#EE7005] hover:bg-[#d66504] disabled:opacity-60 text-white rounded-xl py-4 flex items-center justify-center gap-3 shadow-lg shadow-[#EE7005]/20 transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-[15px] font-black uppercase tracking-wider">Processing…</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span className="text-[15px] font-black uppercase tracking-wider">Proceed to Pay</span>
                      <span className="text-[17px] font-black">₹{effectiveTotal.toFixed(0)}</span>
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#168846]" />
                  <span className="text-[11px] font-bold text-gray-500">100% Secure Payments</span>
                  <Info className="h-3 w-3 text-gray-400" />
                </div>
              </div>

              {paymentResult && !paymentResult.success && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-600 text-center">
                  {paymentResult.error || "Payment failed. Please try again."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 md:hidden safe-area-bottom">
        {!deliveryAddress ? (
          <button
            onClick={() => setAddressSheetOpen(true)}
            className="w-full bg-[#EE7005] hover:bg-[#d66504] text-white rounded-xl py-3.5 flex items-center justify-center gap-2 shadow-lg shadow-[#EE7005]/20 transition-colors"
          >
            <MapPin className="h-4 w-4" />
            <span className="text-[14px] font-black uppercase tracking-wider">Add Address to Proceed</span>
          </button>
        ) : (
          <>
            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full bg-[#EE7005] hover:bg-[#d66504] disabled:opacity-60 text-white rounded-xl py-3.5 flex items-center justify-center gap-3 shadow-lg shadow-[#EE7005]/20 transition-colors"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-[14px] font-black uppercase tracking-wider">Processing…</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span className="text-[14px] font-black uppercase tracking-wider">Proceed to Pay</span>
                  <span className="text-[16px] font-black">₹{effectiveTotal.toFixed(0)}</span>
                </>
              )}
            </button>
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <ShieldCheck className="h-3.5 w-3.5 text-[#168846]" />
              <span className="text-[10px] font-bold text-gray-500">100% Secure Payments</span>
              <Info className="h-3 w-3 text-gray-400" />
            </div>
          </>
        )}
      </div>

      <div className="hidden">
        <DeliveryAddressCard open={addressSheetOpen} onOpenChange={setAddressSheetOpen} />
      </div>


    </main>
  );
}
