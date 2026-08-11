"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useOptimisticCart } from "@/hooks/useOptimisticCart";
import { useRazorpay } from "@/hooks/useRazorpay";
import { useSession } from "@/lib/auth-client";
import { useCartCoupon, useMenuDeliveryAddress, useCartActions } from "@/stores";
import type { AppliedCoupon } from "@/stores";
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
  Loader2, Tag, Percent, ChevronRight, ChevronDown,
  MapPin, Clock, Lock, ShieldCheck, Info,
  Home, Briefcase,
  Check, Calendar as CalendarIcon, X, Edit3, Banknote
} from "lucide-react";
import { toast } from "sonner";

import { AddToCartPopup, type AddPopupItem } from "@/components/menu/add-to-cart-popup";
import { CartSkeleton } from "@/components/cart/cart-skeleton";

const addressIconMap: Record<string, { icon: typeof Home; color: string }> = {
  Home: { icon: Home, color: "text-[#168846] bg-[#168846]/10" },
  Work: { icon: Briefcase, color: "text-gray-500 bg-gray-100" },
  Other: { icon: MapPin, color: "text-gray-500 bg-gray-100" },
};

function startOfDay(d: Date) {
  const n = new Date(d);
  n.setHours(0, 0, 0, 0);
  return n;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isTomorrow(d: Date) {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return isSameDay(startOfDay(d), startOfDay(t));
}

function formatDeliveryDate(d: Date) {
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function toIsoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const CartItemCard = memo(function CartItemCard({
  item,
  deliveryDate,
  onUpdateQuantity,
  onRemove,
}: {
  item: { id: string; name: string; price: number; qty: number; foodType: string; timeSlot: string; kitchenName: string; imageUrl?: string };
  deliveryDate: Date;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  const isVeg = item.foodType.toUpperCase() === "VEG";
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="p-4 sm:p-5 flex gap-4 sm:gap-5">
        <div className="relative h-[90px] w-[90px] sm:h-[100px] sm:w-[100px] shrink-0 rounded-xl bg-gray-50 overflow-hidden border border-gray-100">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              loading="lazy"
              className="object-cover"
              sizes="100px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-gray-300" />
            </div>
          )}
          <div className="absolute bottom-0 left-0 bg-[#168846] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-tr-lg">
             TAKEAWAY
          </div>
        </div>

        <div className="flex-1 flex flex-col sm:flex-row sm:justify-between min-w-0">

          <div className="flex-1 min-w-0 flex flex-col justify-start">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-extrabold text-[16px] text-gray-900 leading-tight">{item.name}</h3>
              {isVeg && (
                <div className="flex items-center gap-1">
                  <div className="h-3.5 w-3.5 rounded-sm border-[1.5px] border-[#168846] flex items-center justify-center p-px">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#168846]" />
                  </div>
                  <span className="text-[11px] font-bold text-[#168846]">Pure Veg</span>
                </div>
              )}
            </div>
            <p className="text-[13px] text-gray-500 mb-3">{item.kitchenName || "Description of item"}</p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-[12px] font-semibold text-gray-500 mt-auto">
               <div className="flex items-center gap-1.5">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  Delivery Date: {formatDeliveryDate(deliveryDate)}
                  {isTomorrow(deliveryDate) && <span className="text-[#168846] font-bold">(Tomorrow)</span>}
               </div>
               <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-gray-400" />
                  Meal Time: {getTimeSlotLabel(item.timeSlot as TimeSlotFilter) || formatTimeSlot(item.timeSlot)}
               </div>
            </div>
          </div>

          <div className="flex flex-col sm:items-end justify-between shrink-0 sm:pl-4 mt-3 sm:mt-0">
             <span className="font-extrabold text-[18px] text-gray-900">₹{item.price}</span>

             <div className="flex items-center gap-4 mt-3 sm:mt-0">
               <div className="flex items-center border border-gray-200 rounded-lg bg-white h-9">
                 <button onClick={() => onUpdateQuantity(item.id, item.qty - 1)} className="w-9 h-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                   <Minus className="h-3.5 w-3.5" />
                 </button>
                 <div className="w-9 h-full flex items-center justify-center border-x border-gray-200 text-[14px] font-bold text-gray-900">
                   {item.qty}
                 </div>
                 <button onClick={() => onUpdateQuantity(item.id, item.qty + 1)} className="w-9 h-full flex items-center justify-center text-[#EE7005] hover:bg-gray-50 transition-colors">
                   <Plus className="h-3.5 w-3.5" />
                 </button>
               </div>
               <button onClick={() => onRemove(item.id)} className="text-[#EE7005] hover:text-red-500 transition-colors">
                 <Trash2 className="h-5 w-5" />
               </button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
});

const PriceBreakdown = memo(function PriceBreakdown({
  itemCounts,
  total,
  packagingCharge,
  deliveryCharge,
  couponSavings,
  finalTotal,
}: {
  itemCounts: number;
  total: number;
  packagingCharge: number;
  deliveryCharge: number;
  couponSavings: number;
  finalTotal: number;
}) {
  return (
    <div>
      <h2 className="text-[18px] font-extrabold text-gray-900 mb-5">Order Summary</h2>
      <div className="space-y-4 text-[14px]">
        <div className="flex justify-between">
          <span className="text-gray-600 font-medium">Item Total ({itemCounts} Items)</span>
          <span className="font-semibold text-gray-900">₹{total.toFixed(0)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 font-medium">Packaging Charges</span>
          <span className="font-semibold text-gray-900">₹{packagingCharge.toFixed(0)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 font-medium flex items-center gap-1">Delivery Charges <Info className="h-3.5 w-3.5 text-gray-400" /></span>
          <span className="font-semibold text-gray-900">₹{deliveryCharge.toFixed(0)}</span>
        </div>
        
        {couponSavings > 0 && (
          <div className="flex justify-between text-[#168846]">
            <span className="font-medium">Coupon Savings</span>
            <span className="font-bold">-₹{couponSavings.toFixed(0)}</span>
          </div>
        )}
        <div className="border-t border-gray-100 pt-5 mt-2 flex justify-between items-center">
          <span className="text-[16px] font-extrabold text-gray-900">Total Amount</span>
          <span className="text-[22px] font-extrabold text-[#168846]">₹{finalTotal.toFixed(0)}</span>
        </div>
      </div>
      {couponSavings > 0 && (
        <div className="mt-5 flex items-center gap-2 bg-[#F0F8F4] rounded-lg px-4 py-3">
          <Tag className="h-5 w-5 text-[#168846]" />
          <span className="text-[13px] font-bold text-[#168846]">You Save ₹{couponSavings.toFixed(0)} on this order</span>
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
  const { applyCoupon, removeCoupon } = useCartActions();
  const razorpayConfigured = !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  const [addressSheetOpen, setAddressSheetOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [deliveryDate, setDeliveryDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [deliverySlot, setDeliverySlot] = useState<string>("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [slotPickerOpen, setSlotPickerOpen] = useState(false);
  const [cravingsOpen, setCravingsOpen] = useState(true);
  const [couponInput, setCouponInput] = useState("");

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

  const deliveryDateLabel = formatDeliveryDate(deliveryDate);

  const minDeliveryDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const timeSlotOptions = useMemo(() => {
    return [...new Set(cart.map((i) => i.timeSlot).filter(Boolean))];
  }, [cart]);

  const selectedSlot = deliverySlot || timeSlotOptions[0] || "";

  const deliveryTimeSlotLabel = useMemo(() => {
    if (!selectedSlot) return "Select Time";
    return getTimeSlotLabel(selectedSlot as TimeSlotFilter) || formatTimeSlot(selectedSlot);
  }, [selectedSlot]);

  const applyCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, cartTotal: total }),
      });
      const json = await res.json().catch(() => ({ error: "Something went wrong" }));
      if (!res.ok) {
        throw new Error(json.error || "Invalid coupon code");
      }
      return json as { code: string; discount: number; type: string; description?: string };
    },
    onSuccess: (json) => {
      applyCoupon({
        code: json.code,
        discount: json.discount,
        type: (json.type as AppliedCoupon["type"]) ?? "FIXED",
        description: json.description,
      });
      toast.success(`Coupon ${json.code} applied — you save ₹${json.discount}`);
      setCouponInput("");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to apply coupon");
    },
  });

  const handleApplyCoupon = useEventCallback(() => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    if (!session?.user) {
      toast.error("Please login to apply coupons");
      return;
    }
    applyCouponMutation.mutate(code);
  });

  const handleCheckout = useEventCallback(async () => {
    if (!deliveryAddress) {
      toast.error("Please select a delivery location before placing your order");
      return;
    }
    if (!razorpayConfigured) {
      toast.error("Online payment is not available.");
      return;
    }
    if (!selectedSlot) {
      toast.error("Please select a delivery time slot");
      return;
    }
    const phone = session?.user?.phoneNumber ?? "";
    const serviceDateType = isTomorrow(deliveryDate) ? "TOMORROW" : "FUTURE";
    await initiateCheckout(
      cart,
      total,
      phone,
      appliedCoupon?.code,
      serviceDateType,
      toIsoDate(deliveryDate),
      selectedSlot,
      defaultAddress?.id
    );
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
    <main className="min-h-screen bg-[#FDFBF9]">
      {/* Top Banner */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-6 mb-2">
        <div className="bg-[#FFF6F0] rounded-2xl p-4 flex items-center gap-4 border border-[#EE7005]/10">
          <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-[#EE7005]/20">
            <CalendarIcon className="h-5 w-5 text-[#EE7005]" />
          </div>
          <div>
            <h3 className="text-[15px] font-extrabold text-gray-900">Pre-Book Orders Only</h3>
            <p className="text-[13px] text-gray-600 font-medium mt-0.5">All orders must be placed in advance. Same day delivery is not available.</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 pb-44 md:pb-10">
        <div className="flex flex-col lg:flex-row gap-8">

          <div className="flex-1 min-w-0 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-5">
                <h1 className="text-[20px] font-extrabold text-gray-900">
                  Your Cart ({itemCounts} Items)
                </h1>
                <button onClick={clearCart} className="md:hidden flex items-center gap-1.5 text-[#EE7005] text-[13px] font-bold">
                  Edit Cart <Edit3 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="space-y-4">
                {cart.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    deliveryDate={deliveryDate}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>
            </div>

            <div className="bg-[#FFF6F0] border border-[#EE7005]/20 rounded-xl p-5 flex items-start gap-4">
              <CalendarIcon className="h-5 w-5 text-[#EE7005] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[14px] font-bold text-[#EE7005]">Pre-Book Notice</h4>
                <p className="text-[13px] text-gray-700 font-medium mt-1">
                  You can only place orders in advance. Please select your preferred delivery date and time.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-[16px] font-extrabold text-gray-900 mb-4">1. Select Delivery Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {addresses.length === 0 ? (
                  <div className="col-span-full text-center py-6 text-gray-500 text-sm font-medium border border-dashed border-gray-300 rounded-xl">
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
                            ? "border-2 border-[#168846] bg-[#F7FDF9] shadow-sm"
                            : "border border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-full ${iconInfo.color} flex items-center justify-center`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-[15px] font-extrabold text-gray-900">{label}</p>
                              <p className="text-[12px] font-medium text-gray-500">{session.user?.name || "User"}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="h-5 w-5 bg-[#168846] rounded-full flex items-center justify-center shrink-0 -mt-1 -mr-1">
                              <Check className="h-3.5 w-3.5 text-white" />
                            </div>
                          )}
                        </div>
                        <p className="text-[12px] text-gray-600 font-medium leading-relaxed">
                          {addr.lineOne}{addr.lineTwo ? `, ${addr.lineTwo}` : ""},<br/>
                          {addr.pincode}<br/>
                          {session.user?.phoneNumber || ""}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
              <button
                onClick={() => setAddressSheetOpen(true)}
                className="w-full mt-3 flex items-center justify-center gap-2 border border-dashed border-[#EE7005]/40 rounded-xl py-3 text-[13px] font-bold text-[#EE7005] hover:bg-[#FFF6F0] transition-colors"
              >
                + Add New Address
              </button>
            </div>

            <div>
              <h2 className="text-[16px] font-extrabold text-gray-900 mb-4">2. Select Delivery Date & Time (Pre-Book Only)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <button type="button" className="flex items-center gap-3 border border-gray-200 rounded-xl p-4 bg-white shadow-sm w-full text-left hover:border-[#EE7005] transition-colors">
                      <CalendarIcon className="h-5 w-5 text-[#EE7005] shrink-0" />
                      <span className="flex-1 text-[14px] font-semibold text-gray-900 truncate">
                        {deliveryDateLabel}
                      </span>
                      {isTomorrow(deliveryDate) && (
                        <span className="text-[11px] font-bold text-[#168846] bg-[#E8F5EE] rounded-full px-2 py-0.5 shrink-0">
                          Tomorrow
                        </span>
                      )}
                      <ChevronDown className="h-5 w-5 text-gray-400 shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0 rounded-xl border-gray-200">
                    <Calendar
                      mode="single"
                      selected={deliveryDate}
                      onSelect={(d) => {
                        if (d) {
                          const picked = new Date(d);
                          picked.setHours(0, 0, 0, 0);
                          setDeliveryDate(picked);
                          setDatePickerOpen(false);
                        }
                      }}
                      disabled={{ before: minDeliveryDate }}
                    />
                  </PopoverContent>
                </Popover>

                <Popover open={slotPickerOpen} onOpenChange={setSlotPickerOpen}>
                  <PopoverTrigger asChild>
                    <button type="button" className="flex items-center justify-between border border-gray-200 rounded-xl p-4 bg-white shadow-sm w-full text-left hover:border-[#EE7005] transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <Clock className="h-5 w-5 text-[#EE7005] shrink-0" />
                        <span className="text-[14px] font-semibold text-gray-900 truncate">{deliveryTimeSlotLabel}</span>
                      </div>
                      <ChevronDown className="h-5 w-5 text-gray-400 shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-64 p-2 rounded-xl border-gray-200">
                    <p className="text-[12px] font-bold text-gray-500 px-3 pt-2 pb-1">Delivery Time</p>
                    {timeSlotOptions.length === 0 ? (
                      <p className="text-[13px] text-gray-400 font-medium px-3 py-3">No time slots available</p>
                    ) : (
                      timeSlotOptions.map((slot) => {
                        const isActive = selectedSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => {
                              setDeliverySlot(slot);
                              setSlotPickerOpen(false);
                            }}
                            className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-colors ${
                              isActive ? "bg-[#E8F5EE] text-[#168846]" : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {getTimeSlotLabel(slot as TimeSlotFilter) || formatTimeSlot(slot)}
                            {isActive && <Check className="h-4 w-4" />}
                          </button>
                        );
                      })
                    )}
                  </PopoverContent>
                </Popover>
              </div>
              <div className="mt-4 flex items-center gap-2 bg-[#E8F5EE] rounded-lg px-4 py-3">
                <Info className="h-5 w-5 text-[#168846]" />
                <span className="text-[13px] font-medium text-[#168846]">Orders for the same day are not accepted. Please choose a future date.</span>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[420px] shrink-0">
            <div className="lg:sticky lg:top-24 space-y-6">

              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <PriceBreakdown
                  itemCounts={itemCounts}
                  total={total}
                  packagingCharge={packagingCharge}
                  deliveryCharge={effectiveDeliveryCharge}
                  couponSavings={couponSavings}
                  finalTotal={effectiveTotal}
                />
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <h2 className="text-[16px] font-extrabold text-gray-900 mb-4">Apply Coupon</h2>
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleApplyCoupon();
                  }}
                >
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter coupon code"
                    disabled={applyCouponMutation.isPending || !!appliedCoupon}
                    className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-[14px] font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#EE7005] focus:ring-1 focus:ring-[#EE7005] disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={applyCouponMutation.isPending || !couponInput.trim() || !!appliedCoupon}
                    onClick={handleApplyCoupon}
                    className="bg-[#EE7005] text-white px-5 py-3 rounded-lg text-[13px] font-extrabold uppercase tracking-wider hover:bg-[#d66504] transition-colors shadow-sm disabled:opacity-60"
                  >
                    {applyCouponMutation.isPending ? "..." : "Apply"}
                  </button>
                </form>
                {appliedCoupon && (
                  <div className="mt-3 flex items-center justify-between bg-[#F0F8F4] rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-6">
                      <span className="text-[14px] font-extrabold text-gray-900">{appliedCoupon.code}</span>
                      <span className="text-[13px] font-bold text-[#168846]">You saved ₹{appliedCoupon.discount}</span>
                    </div>
                    <button onClick={removeCoupon} className="text-red-500 hover:text-red-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <h2 className="text-[16px] font-extrabold text-gray-900 mb-4">Available Offers</h2>
                <div className="space-y-4">
                  {availableCoupons.length === 0 ? (
                    <p className="text-[13px] text-gray-500 font-medium text-center py-4">No offers available right now</p>
                  ) : (
                    availableCoupons.map((offer) => (
                      <div key={offer.code} className="flex items-start gap-4">
                        <div className="h-9 w-9 rounded-full border border-dashed border-[#168846] flex items-center justify-center shrink-0 bg-[#F0F8F4] mt-0.5">
                          <Percent className="h-4 w-4 text-[#168846]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-gray-900">{offer.description}</p>
                          <p className="text-[12px] font-bold text-gray-500 mt-1">{offer.code}</p>
                        </div>
                        <span className="text-[11px] font-bold text-gray-500 mt-1 shrink-0">T&C</span>
                      </div>
                    ))
                  )}
                </div>
                {availableCoupons.length > 0 && (
                  <button className="mt-5 text-[#EE7005] text-[13px] font-bold flex items-center justify-between w-full">
                    View More Offers <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <h2 className="text-[16px] font-extrabold text-gray-900 mb-4">Payment Method</h2>
                <div className="flex items-start gap-3 bg-[#F0F8F4] rounded-xl p-4">
                  <div className="h-9 w-9 rounded-full bg-[#168846] flex items-center justify-center shrink-0 mt-0.5">
                    <Banknote className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-extrabold text-gray-900">Online Payment Only</p>
                    <p className="text-[12px] text-gray-600 font-medium mt-1">RRC Kitchen accepts only online payments.<br/>We do not accept Cash on Delivery.</p>
                  </div>
                  <ShieldCheck className="h-6 w-6 text-[#168846] shrink-0" />
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
                      <span className="text-[15px] font-extrabold uppercase tracking-wider">Processing…</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      <span className="text-[15px] font-extrabold uppercase tracking-wider">Proceed to Pay</span>
                      <span className="text-[17px] font-extrabold">₹{effectiveTotal.toFixed(0)}</span>
                    </>
                  )}
                </button>
                <div className="mt-3 bg-[#FFF6F0] rounded-xl py-2 flex items-center justify-center gap-2 text-[#EE7005]">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-[12px] font-bold">100% Secure Payments</span>
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
            className="w-full bg-[#EE7005] hover:bg-[#d66504] text-white rounded-xl py-4 px-6 flex items-center justify-center gap-3 shadow-lg shadow-[#EE7005]/20 transition-colors"
          >
            <MapPin className="h-5 w-5" />
            <span className="text-[15px] font-extrabold tracking-wide">Add Address to Proceed</span>
          </button>
        ) : (
          <>
            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full bg-[#EE7005] hover:bg-[#d66504] disabled:opacity-60 text-white rounded-xl py-4 px-6 flex items-center justify-center gap-3 shadow-lg shadow-[#EE7005]/20 transition-colors"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-[15px] font-extrabold tracking-wide">Processing...</span>
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5" />
                  <span className="text-[15px] font-extrabold tracking-wide">Proceed to Pay</span>
                  <span className="text-[18px] font-extrabold">₹{effectiveTotal.toFixed(0)}</span>
                </>
              )}
            </button>
            <div className="mt-3 bg-[#FFF6F0] rounded-xl py-2 flex items-center justify-center gap-2 text-[#EE7005]">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="text-[11px] font-bold">100% Secure Payments</span>
            </div>
          </>
        )}
      </div>

      <DeliveryAddressCard open={addressSheetOpen} onOpenChange={setAddressSheetOpen} />

    </main>
  );
}
