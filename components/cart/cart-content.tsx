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
  Check, Calendar as CalendarIcon, X, Banknote
} from "lucide-react";
import { toast } from "sonner";

import { AddToCartPopup, type AddPopupItem } from "@/components/menu/add-to-cart-popup";
import { CartSkeleton } from "@/components/cart/cart-skeleton";

const addressIconMap: Record<string, { icon: typeof Home; color: string }> = {
  Home: { icon: Home, color: "" },
  Work: { icon: Briefcase, color: "" },
  Other: { icon: MapPin, color: "" },
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
    <div className="flex gap-3 sm:gap-5 py-5">
      {/* Food Image */}
      <div className="relative h-[80px] w-[80px] sm:h-[90px] sm:w-[90px] shrink-0 rounded-[7px] bg-gray-100 overflow-hidden">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            loading="lazy"
            className="object-cover"
            sizes="(max-width: 640px) 80px, 90px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ShoppingBag className="h-6 w-6 text-gray-300" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col sm:flex-row sm:items-start min-w-0 gap-2 sm:gap-4">
        <div className="flex-1 min-w-0">
          {/* Name + Veg Badge */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-[15px] text-[#171717] leading-snug">{item.name}</h3>
            {isVeg && (
              <div className="flex items-center gap-1 shrink-0">
                <div className="h-2.5 w-2.5 rounded-full bg-[#16803A]" />
                <span className="text-[11px] font-semibold text-[#16803A]">Pure Veg</span>
              </div>
            )}
          </div>
          {/* Kitchen/description */}
          <p className="text-[13px] text-[#555555] mb-3 leading-snug">{item.kitchenName || "Home-cooked meal"}</p>
          {/* Date + Meal Time */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-[#555555]">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5 text-[#999999] shrink-0" />
              <span>
                Delivery Date:{" "}
                {deliveryDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                {isTomorrow(deliveryDate) && (
                  <span className="text-[#171717] ml-1">(Tomorrow)</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#999999] shrink-0" />
              <span>Meal Time: {getTimeSlotLabel(item.timeSlot as TimeSlotFilter) || formatTimeSlot(item.timeSlot)}</span>
            </div>
          </div>
        </div>

        {/* Price + Qty + Delete — right side */}
        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 lg:gap-8 shrink-0 mt-3 sm:mt-0 w-full sm:w-auto">
          <span className="font-bold text-[16px] text-[#171717]">₹{item.price}</span>
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Qty Stepper */}
            <div className="flex items-center border border-[#DEDEDE] rounded-[6px] bg-white h-8">
              <button
                onClick={() => onUpdateQuantity(item.id, item.qty - 1)}
                className="w-8 h-full flex items-center justify-center text-[#FE4D02] hover:bg-gray-50 transition-colors rounded-l-[6px]"
              >
                <Minus className="h-3 w-3" />
              </button>
              <div className="w-8 h-full flex items-center justify-center border-x border-[#E5E5E5] text-[13px] font-bold text-[#222222]">
                {item.qty}
              </div>
              <button
                onClick={() => onUpdateQuantity(item.id, item.qty + 1)}
                className="w-8 h-full flex items-center justify-center text-[#FE4D02] hover:bg-gray-50 transition-colors rounded-r-[6px]"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
            {/* Delete */}
            <button
              onClick={() => onRemove(item.id)}
              className="text-[#FE4D02] hover:opacity-80 transition-opacity"
            >
              <Trash2 style={{ width: 18, height: 18 }} />
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
      <h2 className="text-[18px] font-bold text-[#171717] mb-5">Order Summary</h2>
      <div className="space-y-3.5 text-[14px]">
        <div className="flex justify-between items-center">
          <span className="text-[#444444]">Item Total ({itemCounts} Items)</span>
          <span className="font-medium text-[#222222]">₹{total.toFixed(0)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#444444]">Packaging Charges</span>
          <span className="font-medium text-[#222222]">₹{packagingCharge.toFixed(0)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#444444] flex items-center gap-1">Delivery Charges <Info className="h-3.5 w-3.5 text-[#999999]" /></span>
          <span className="font-medium text-[#222222]">₹{deliveryCharge.toFixed(0)}</span>
        </div>
        {couponSavings > 0 && (
          <div className="flex justify-between items-center text-[#16803A]">
            <span>Coupon Savings</span>
            <span className="font-semibold">-₹{couponSavings.toFixed(0)}</span>
          </div>
        )}
      </div>
      {/* Divider + Total */}
      <div className="border-t border-[#EEEEEE] mt-4 pt-4 flex justify-between items-center">
        <span className="text-[16px] font-bold text-[#171717]">Total Amount</span>
        <span className="text-[24px] font-bold text-[#166B32]">₹{finalTotal.toFixed(0)}</span>
      </div>
      {/* Savings banner — always shown when coupon applied */}
      {couponSavings > 0 && (
        <div className="mt-4 flex items-center gap-2 bg-[#F1F8F1] border border-[#E1EFE1] rounded-[7px] px-4 py-3">
          <Tag className="h-[18px] w-[18px] text-[#16803A] shrink-0" />
          <span className="text-[13px] font-semibold text-[#166B32]">You Save ₹{couponSavings.toFixed(0)} on this order</span>
        </div>
      )}
    </div>
  );
});

export function CartContent() {
  const { cart, updateQuantity, removeFromCart, total } = useOptimisticCart();
  const { initiateCheckout, isProcessing, paymentResult, resetPayment } = useRazorpay();
  const { data: session, isPending } = useSession();
  const deliveryAddress = useMenuDeliveryAddress();
  const appliedCoupon = useCartCoupon();
  const { applyCoupon, removeCoupon } = useCartActions();

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
            <p className="mt-1 text-xs text-muted-foreground font-mono">Order ID: {paymentResult.publicCode}</p>
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
            <p className="mt-2 text-sm text-muted-foreground">Please login to see your cart and place orders.</p>
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
    <main className="min-h-screen bg-[#F8F8F8]">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 mb-2">
        <div className="bg-[#FFF8F0] rounded-[8px] p-4 flex items-start sm:items-center gap-3 sm:gap-4 border border-[#FFE6D5]">
          <div className="flex items-center justify-center shrink-0">
            <CalendarIcon className="h-5 w-5 text-[#FE4D02]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-bold text-[#F4511E]">Pre-Book Orders Only</h3>
            <p className="text-[13px] text-[#444444] font-medium mt-0.5">All orders must be placed in advance. Same-day delivery is not available.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 pb-44 md:pb-10">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8">

          <div className="flex-1 min-w-0 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-[20px] font-bold text-[#171717]">
                  Your Cart ({itemCounts} Items)
                </h1>
                <Link href="/kitchens">
                  <Button variant="outline" size="sm" className="text-[#FE4D02] border-[#FE4D02] hover:bg-[#FFF7F0] h-8 px-3 rounded-[7px] text-[13px] font-bold transition-colors">
                    + Add Items
                  </Button>
                </Link>
              </div>

              {/* Cart items — single white card with dividers */}
              <div className="bg-[#FFFFFF] rounded-[8px] border border-[#E7E7E7] overflow-hidden" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
                <div className="divide-y divide-[#E7E7E7]">
                  {cart.map((item) => (
                    <div key={item.id} className="px-4 sm:px-5">
                      <CartItemCard
                        item={item}
                        deliveryDate={deliveryDate}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeFromCart}
                      />
                    </div>
                  ))}
                </div>

                {/* Pre-Book Notice — inside the cart card at the bottom */}
                <div className="border-t border-[#E7E7E7] bg-[#FFF7EF] px-4 sm:px-5 py-4 flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0">
                    <CalendarIcon className="text-[#FE4D02]" style={{ width: 18, height: 18 }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#F4511E] leading-snug">Pre-Book Notice</p>
                    <p className="text-[12px] text-[#444444] font-medium mt-0.5 leading-relaxed">
                      You can only place orders in advance. Please select your preferred delivery date and time.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-[16px] font-bold text-[#171717] mb-4">1. Select Delivery Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {addresses.length === 0 ? (
                  <>
                    {/* No addresses — show empty state + add card */}
                    <div className="col-span-3 text-center py-6 text-gray-500 text-sm font-medium border border-dashed border-gray-300 rounded-xl">
                      No saved addresses. Please add one below.
                    </div>
                  </>
                ) : (
                  addresses.map((addr) => {
                    const label = addr.label || "Other";
                    const iconInfo = addressIconMap[label] ?? addressIconMap.Other;
                    const Icon = iconInfo.icon;
                    const isSelected = defaultAddress?.id === addr.id;
                    // Abbreviate name: first name + last initial
                    const fullName = session.user?.name || "User";
                    const nameParts = fullName.trim().split(" ");
                    const displayName = nameParts.length > 1
                      ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
                      : fullName;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`relative rounded-[8px] p-4 cursor-pointer transition-all flex flex-col min-w-0 ${
                          isSelected
                            ? "border-[1.5px] border-[#5BA86B] bg-[#F5FBF6]"
                            : "border border-[#E2E2E2] bg-[#FFFFFF] hover:border-[#A9D3B3] hover:bg-[#FAFDFA]"
                        }`}
                      >
                        {/* Selected checkmark badge */}
                        {isSelected && (
                          <div className="absolute -top-3 -right-3 h-6 w-6 bg-[#16803A] rounded-full flex items-center justify-center shrink-0 ring-[4px] ring-[#F8F8F8] z-10">
                            <Check className="h-3.5 w-3.5 text-white" strokeWidth={3.5} />
                          </div>
                        )}
                        {/* Icon + label row */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                            isSelected ? "bg-[#EEF8EF] text-[#16803A]" : "bg-[#F5F5F5] text-[#333333]"
                          }`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[15px] font-bold text-[#171717] leading-tight truncate">{label}</p>
                            <p className="text-[12px] font-medium text-[#444444] truncate">{displayName}</p>
                          </div>
                        </div>
                        {/* Address lines */}
                        <p className="text-[12px] text-[#444444] font-medium leading-relaxed break-words">
                          {addr.lineOne}{addr.lineTwo ? `, ${addr.lineTwo}` : ""},<br />
                          {addr.pincode}<br />
                          {session.user?.phoneNumber || ""}
                        </p>
                      </div>
                    );
                  })
                )}
                {/* Add New Address — always shown as last card */}
                <div
                  onClick={() => setAddressSheetOpen(true)}
                  className="flex items-center justify-center rounded-[8px] border border-dashed border-[#FFB894] bg-[#FFFCFA] cursor-pointer hover:bg-[#FFF7F0] transition-colors min-h-[120px] p-4 min-w-0"
                >
                  <span className="text-[14px] font-bold text-[#FE4D02] text-center break-words">+ Add New Address</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-[16px] font-bold text-[#171717] mb-4">2. Select Delivery Date &amp; Time (Pre-Book Only)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Date picker */}
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-3 border border-[#DFDFDF] rounded-[7px] px-4 py-3.5 bg-[#FFFFFF] w-full text-left hover:border-[#FE4D02] transition-colors focus:border-[#FE4D02] focus:ring-4 focus:ring-[#FE4D02]/10"
                    >
                      <CalendarIcon className="h-[18px] w-[18px] text-[#222222] shrink-0" />
                      <span className="flex-1 text-[14px] font-medium text-[#222222]">
                        {deliveryDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                        {isTomorrow(deliveryDate) && (
                          <span className="text-[#222222]"> (Tomorrow)</span>
                        )}
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0 rounded-xl border-[#DFDFDF]">
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

                {/* Time slot picker */}
                <Popover open={slotPickerOpen} onOpenChange={setSlotPickerOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-3 border border-[#DFDFDF] rounded-[7px] px-4 py-3.5 bg-[#FFFFFF] w-full text-left hover:border-[#FE4D02] transition-colors focus:border-[#FE4D02] focus:ring-4 focus:ring-[#FE4D02]/10"
                    >
                      <Clock className="h-[18px] w-[18px] text-[#222222] shrink-0" />
                      <span className="flex-1 text-[14px] font-medium text-[#222222] truncate">
                        {deliveryTimeSlotLabel}
                      </span>
                      <ChevronDown className="h-5 w-5 text-[#222222] shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-64 p-2 rounded-[7px] border-[#DFDFDF]">
                    <p className="text-[12px] font-bold text-[#595959] px-3 pt-2 pb-1">Delivery Time</p>
                    {timeSlotOptions.length === 0 ? (
                      <p className="text-[13px] text-[#999999] font-medium px-3 py-3">No time slots available</p>
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
                              isActive ? "bg-[#F0F9F1] text-[#16803A]" : "text-[#171717] hover:bg-gray-50"
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
              {/* Info notice */}
              <div className="mt-3 flex items-center gap-2 bg-[#F0F8F0] border border-[#E1F0E2] rounded-[6px] px-4 py-3">
                <Info className="h-[18px] w-[18px] text-[#16803A] shrink-0" />
                <span className="text-[13px] font-medium text-[#347345]">Orders for the same day are not accepted. Please choose a future date.</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-[320px] lg:w-[380px] shrink-0">
            <div className="md:sticky md:top-24 space-y-5">

              {/* Order Summary card */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <PriceBreakdown
                  itemCounts={itemCounts}
                  total={total}
                  packagingCharge={packagingCharge}
                  deliveryCharge={effectiveDeliveryCharge}
                  couponSavings={couponSavings}
                  finalTotal={effectiveTotal}
                />
              </div>

              {/* Apply Coupon card */}
              <div className="bg-[#FFFFFF] border border-[#E7E7E7] rounded-[8px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                <h2 className="text-[16px] font-bold text-[#171717] mb-4">Apply Coupon</h2>
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
                    className="flex-1 min-w-0 border border-[#DEDEDE] rounded-[7px] px-4 py-3 text-[14px] text-[#222222] placeholder-[#595959] focus:outline-none focus:border-[#FE4D02] disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={applyCouponMutation.isPending || !couponInput.trim() || !!appliedCoupon}
                    onClick={handleApplyCoupon}
                    className="bg-[#FE4D02] shrink-0 text-white px-5 py-3 rounded-[7px] text-[13px] font-bold tracking-wide hover:bg-[#F04400] transition-colors disabled:opacity-60"
                  >
                    {applyCouponMutation.isPending ? "..." : "APPLY"}
                  </button>
                </form>
                {/* Applied coupon row */}
                {appliedCoupon && (
                  <div className="mt-3 flex items-center justify-between border border-[#E0EFE0] rounded-[7px] px-4 py-3 bg-[#F1F8F1]">
                    <span className="text-[14px] font-semibold text-[#222222]">{appliedCoupon.code}</span>
                    <span className="text-[13px] font-semibold text-[#16803A]">You saved ₹{appliedCoupon.discount}</span>
                    <button onClick={removeCoupon} className="text-[#FE4D02] hover:opacity-80 ml-2">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Available Offers card */}
              <div className="bg-[#FFFFFF] border border-[#E7E7E7] rounded-[8px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                <h2 className="text-[16px] font-bold text-[#171717] mb-4">Available Offers</h2>
                <div className="space-y-4">
                  {availableCoupons.length === 0 ? (
                    <p className="text-[13px] text-[#595959] text-center py-4">No offers available right now</p>
                  ) : (
                    availableCoupons.map((offer) => (
                      <div key={offer.code} className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-full border border-[#CFE7D2] flex items-center justify-center shrink-0 bg-[#F0F8F0]">
                          <Percent className="h-4 w-4 text-[#16803A]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-[#222222] leading-snug">{offer.description}</p>
                          <p className="text-[12px] font-bold text-[#222222] mt-0.5">{offer.code}</p>
                        </div>
                        <span className="text-[12px] font-bold text-[#595959] shrink-0 mt-0.5">T&amp;C</span>
                      </div>
                    ))
                  )}
                </div>
                {availableCoupons.length > 0 && (
                  <button className="mt-5 text-[#FE4D02] text-[13px] font-bold flex items-center gap-1 w-full">
                    View More Offers <ChevronRight className="h-4 w-4 text-[#FE4D02]" />
                  </button>
                )}
              </div>

              {/* Payment Method card */}
              <div className="bg-[#FFFFFF] border border-[#E7E7E7] rounded-[8px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                <h2 className="text-[16px] font-bold text-[#171717] mb-4">Payment Method</h2>
                <div className="flex items-center gap-3 bg-[#F1F8F1] border border-[#E0EFE0] rounded-[8px] p-4">
                  <div className="h-10 w-10 flex items-center justify-center shrink-0">
                    <Banknote className="h-6 w-6 text-[#16803A]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-[#166B32]">Online Payment Only</p>
                    <p className="text-[12px] text-[#444444] font-medium mt-0.5">RRC Kitchen accepts only online payments.<br />We do not accept Cash on Delivery.</p>
                  </div>
                  <ShieldCheck className="h-7 w-7 text-[#16803A] shrink-0" />
                </div>
              </div>

              <div className="hidden md:block">
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full bg-[#FE4D02] hover:bg-[#F04400] disabled:opacity-60 text-white rounded-[7px] py-3.5 flex items-center justify-center gap-3 shadow-[0_3px_8px_rgba(254,77,2,0.16)] transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-[15px] font-bold uppercase tracking-widest">Processing…</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span className="text-[15px] font-bold uppercase tracking-widest">Proceed to Pay</span>
                      <span className="text-[17px] font-bold">₹{effectiveTotal.toFixed(0)}</span>
                    </>
                  )}
                </button>
                {/* Secure badge */}
                <div className="mt-3 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="h-[15px] w-[15px] text-[#16803A]" />
                  <span className="text-[12px] font-semibold text-[#F4511E]">100% Secure Payments</span>
                  <ShieldCheck className="h-[15px] w-[15px] text-[#16803A]" />
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

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#FFFFFF] border-t border-[#E7E7E7] p-4 md:hidden safe-area-bottom">
        {!deliveryAddress ? (
          <button
            onClick={() => setAddressSheetOpen(true)}
            className="w-full bg-[#FE4D02] hover:bg-[#F04400] text-white rounded-[7px] py-3.5 flex items-center justify-center gap-3 shadow-[0_3px_8px_rgba(254,77,2,0.16)] transition-colors"
          >
            <MapPin className="h-4 w-4" />
            <span className="text-[15px] font-bold tracking-wide uppercase">Add Address to Proceed</span>
          </button>
        ) : (
          <>
            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full bg-[#FE4D02] hover:bg-[#F04400] disabled:opacity-60 text-white rounded-[7px] py-3.5 flex items-center justify-center gap-3 shadow-[0_3px_8px_rgba(254,77,2,0.16)] transition-colors"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-[15px] font-bold tracking-wide uppercase">Processing...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span className="text-[15px] font-bold tracking-wide uppercase">Proceed to Pay</span>
                  <span className="text-[18px] font-bold">₹{effectiveTotal.toFixed(0)}</span>
                </>
              )}
            </button>
            <div className="mt-3 bg-transparent py-2 flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-[15px] w-[15px] text-[#16803A]" />
              <span className="text-[12px] font-semibold text-[#F4511E]">100% Secure Payments</span>
              <ShieldCheck className="h-[15px] w-[15px] text-[#16803A]" />
            </div>
          </>
        )}
      </div>

      <DeliveryAddressCard open={addressSheetOpen} onOpenChange={setAddressSheetOpen} />

    </main>
  );
}
