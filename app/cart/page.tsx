"use client";

import { memo, useCallback, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useOptimisticCart } from "@/hooks/useOptimisticCart";
import { createBadgeVariant, formatTimeSlot } from "@/lib/patterns";
import { ErrorBoundary } from "@/components/patterns/error-boundary";
import { useRazorpay } from "@/hooks/useRazorpay";
import { useSession } from "@/lib/auth-client";
import { useCartCoupon, useCartOrderType, useCartActions, useMenuDeliveryAddress } from "@/stores";
import { DeliveryAddressCard } from "@/components/cart/delivery-address-card";
import { useEventCallback } from "@/hooks/useStableReference";
import dynamic from "next/dynamic";
import { AddToCartPopup, type AddPopupItem } from "@/components/menu/add-to-cart-popup";
import type { PaymentMethod } from "@/components/order/payment-method-selector";
import {
  Trash2, Minus, Plus, ShoppingBag, ArrowLeft, CreditCard,
  Loader2, Banknote, Tag, Percent, Gift, ChevronRight,
  Wallet, Smartphone, Building2, Gem, Flame, MapPin,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const CravingsPopup = dynamic(() => import("@/components/order/cravings-popup").then(m => m.CravingsPopup), { ssr: false });
const CouponInput = dynamic(() => import("@/components/order/coupon-input").then(m => m.CouponInput), { ssr: false });
const PaymentMethodSelector = dynamic(() => import("@/components/order/payment-method-selector").then(m => m.PaymentMethodSelector), { ssr: false });
const OrderTypeSelector = dynamic(() => import("@/components/order/order-type-selector").then(m => m.OrderTypeSelector), { ssr: false });

interface CouponOffer {
  code: string;
  description: string;
  discountValue: number;
  discountType: string;
  minOrderValue: number | null;
}

interface PaymentOfferData {
  id: string;
  name: string;
  description: string;
  offerType: "UPI" | "WALLET" | "CARDS" | "NETBANKING" | "ALL";
  discountValue: number;
  discountType: "FLAT" | "PERCENTAGE";
  maxDiscount: number | null;
  minOrderValue: number | null;
}

interface SuggestedItem {
  id: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  foodType: string;
  timeSlot: string;
  photos: { imageUrl: string }[];
  menu: { kitchenPartner: { kitchenAlias: { displayName: string } | null } | null };
}

const offerIcons: Record<string, { icon: typeof Smartphone; label: string; color: string }> = {
  UPI: { icon: Smartphone, label: "UPI", color: "text-purple-600 bg-purple-100" },
  WALLET: { icon: Gem, label: "Wallet", color: "text-emerald-600 bg-emerald-100" },
  CARDS: { icon: CreditCard, label: "Cards", color: "text-blue-600 bg-blue-100" },
  NETBANKING: { icon: Building2, label: "Net Banking", color: "text-orange-600 bg-orange-100" },
  ALL: { icon: Wallet, label: "All Methods", color: "text-primary bg-primary/10" },
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
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="h-16 w-16 shrink-0 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              width={64}
              height={64}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : (
            <ShoppingBag className="h-6 w-6 text-muted-foreground/40" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold truncate">{item.name}</span>
            <Badge
              variant={createBadgeVariant(item.foodType)}
              className="shrink-0 text-[9px] px-1.5 py-0"
            >
              {item.foodType}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{item.kitchenName}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{formatTimeSlot(item.timeSlot)}</p>
          <p className="mt-1 text-sm font-bold">
            ₹{item.price} <span className="text-xs font-normal text-muted-foreground">× {item.qty}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onUpdateQuantity(item.id, item.qty - 1)}>
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onUpdateQuantity(item.id, item.qty + 1)}>
            <Plus className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onRemove(item.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

const SuggestedItemCard = memo(function SuggestedItemCard({
  item,
  qty,
  onAdd,
  onUpdateQuantity,
  onShowPopup,
}: {
  item: SuggestedItem;
  qty: number;
  onAdd: (item: { id: string; name: string; price: number; compareAtPrice: number | null; foodType: string; timeSlot: string; kitchenName: string; imageUrl?: string | null }) => void;
  onUpdateQuantity: (id: string, qty: number) => void;
  onShowPopup: (item: { id: string; name: string; price: number; compareAtPrice: number | null; foodType: string; timeSlot: string; kitchenName: string; imageUrl?: string | null }) => void;
}) {
  const kitchenName = item.menu?.kitchenPartner?.kitchenAlias?.displayName ?? "";
  const itemData = {
    id: item.id,
    name: item.name,
    price: Number(item.price),
    compareAtPrice: item.compareAtPrice,
    foodType: item.foodType,
    timeSlot: item.timeSlot,
    kitchenName,
    imageUrl: item.photos?.[0]?.imageUrl ?? null,
  };

  const handleAdd = () => {
    onAdd(itemData);
    onShowPopup(itemData);
  };

  const handleIncrement = () => {
    const newQty = qty + 1;
    onUpdateQuantity(item.id, newQty);
    onShowPopup(itemData);
  };

  const handleDecrement = () => {
    onUpdateQuantity(item.id, qty - 1);
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-square w-full bg-white p-2">
        {item.photos?.[0]?.imageUrl ? (
          <Image
            src={item.photos[0].imageUrl}
            alt={item.name}
            fill
            loading="lazy"
            decoding="async"
            className="object-contain p-1"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <ShoppingBag className="h-6 w-6 text-muted-foreground/30" />
          </div>
        )}
      </div>
      <CardContent className="p-2.5 space-y-1.5">
        <p className="text-xs font-bold leading-tight line-clamp-2">{item.name}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-black text-foreground">₹{Number(item.price)}</span>
          {qty === 0 ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-6 rounded-md border-[#EE7005] text-[#EE7005] px-2 text-[10px] font-bold hover:text-[#EE7005]"
              onClick={handleAdd}
            >
              Add
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-6 w-6 rounded-full p-0 border-[#EE7005] text-[#EE7005]"
                onClick={handleDecrement}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-5 text-center text-xs font-bold text-[#EE7005]">{qty}</span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-6 w-6 rounded-full p-0 border-[#EE7005] text-[#EE7005]"
                onClick={handleIncrement}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

const CouponOffersPanel = memo(function CouponOffersPanel({
  show,
  loading,
  offers,
  appliedCoupon,
  onToggle,
  onApply,
  onApplyCoupon,
  onRemoveCoupon,
  total,
}: {
  show: boolean;
  loading: boolean;
  offers: CouponOffer[];
  appliedCoupon: { code: string; discount: number; type: "PERCENTAGE" | "FIXED" | "FREE_DELIVERY"; description?: string } | null;
  onToggle: () => void;
  onApply: (code: string) => void;
  onApplyCoupon: (coupon: { code: string; discount: number; type: "PERCENTAGE" | "FIXED" | "FREE_DELIVERY"; description?: string }) => void;
  onRemoveCoupon: () => void;
  total: number;
}) {
  const renderCouponContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      );
    }
    if (offers.length === 0) {
      return (
        <div className="text-center py-4">
          <Gift className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">No coupon offers available right now</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Enter your own coupon code below</p>
        </div>
      );
    }
    return offers.map((offer) => (
      <button
        key={offer.code}
        type="button"
        onClick={() => onApply(offer.code)}
        disabled={!!appliedCoupon}
        className="flex items-center gap-3 w-full rounded-xl border border-dashed border-primary/30 p-3 text-left hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Percent className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-primary">{offer.code}</p>
          <p className="text-xs text-muted-foreground truncate">{offer.description}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-semibold text-green-600">
            {offer.discountType === "PERCENTAGE" ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}
          </p>
          {offer.minOrderValue && (
            <p className="text-[10px] text-muted-foreground">Min ₹{offer.minOrderValue}</p>
          )}
        </div>
      </button>
    ));
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">View Coupon Offers</span>
        </div>
        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${show ? "rotate-90" : ""}`} />
      </button>
      {show && (
        <Card className="p-3 space-y-2">
          {renderCouponContent()}
          <CouponInput
            onApply={onApplyCoupon}
            onRemove={onRemoveCoupon}
            appliedCoupon={appliedCoupon}
            cartTotal={total}
          />
        </Card>
      )}
    </div>
  );
});

const PaymentOffersPanel = memo(function PaymentOffersPanel({
  show,
  offers,
  selectedId,
  onToggle,
  onSelect,
}: {
  show: boolean;
  offers: PaymentOfferData[];
  selectedId: string | null;
  onToggle: () => void;
  onSelect: (offer: PaymentOfferData | null) => void;
}) {
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Payment Offers</span>
        </div>
        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${show ? "rotate-90" : ""}`} />
      </button>
      {show && (
        <div className="space-y-2">
          {offers.length === 0 ? (
            <div className="text-center py-4">
              <Wallet className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No payment offers available</p>
            </div>
          ) : (
            offers.map((offer) => {
              const info = offerIcons[offer.offerType] ?? offerIcons.ALL;
              const Icon = info.icon;
              const isSelected = selectedId === offer.id;
              const discountLabel = offer.discountType === "FLAT"
                ? `₹${offer.discountValue} off`
                : `${offer.discountValue}% off${offer.maxDiscount ? ` (up to ₹${offer.maxDiscount})` : ""}`;
              return (
                <button
                  key={offer.id}
                  type="button"
                  onClick={() => onSelect(isSelected ? null : offer)}
                  className={`flex items-center gap-3 w-full rounded-xl border p-3 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className={`h-9 w-9 rounded-lg ${info.color} flex items-center justify-center shrink-0`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{offer.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{offer.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-green-600">{discountLabel}</p>
                    {offer.minOrderValue && (
                      <p className="text-[10px] text-muted-foreground">Min ₹{offer.minOrderValue}</p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
});

const PriceBreakdown = memo(function PriceBreakdown({
  itemCounts,
  total,
  couponSavings,
  paymentOfferSavings,
  savings,
  finalTotal,
}: {
  itemCounts: number;
  total: number;
  couponSavings: number;
  paymentOfferSavings: number;
  savings: number;
  finalTotal: number;
}) {
  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Subtotal ({itemCounts} items)</span>
        <span>₹{total.toFixed(0)}</span>
      </div>
      {couponSavings > 0 && (
        <div className="flex justify-between text-green-600">
          <span>Coupon Savings</span>
          <span>-₹{couponSavings.toFixed(0)}</span>
        </div>
      )}
      {paymentOfferSavings > 0 && (
        <div className="flex justify-between text-green-600">
          <span>Payment Offer</span>
          <span>-₹{paymentOfferSavings.toFixed(0)}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span className="text-muted-foreground">Delivery Fee</span>
        <span className="text-green-600 font-medium">Free</span>
      </div>
      <Separator />
      <div className="flex justify-between text-lg font-bold">
        <span>Total</span>
        <span>₹{finalTotal.toFixed(0)}</span>
      </div>
      {savings > 0 && (
        <p className="text-xs text-green-600 text-right">You save ₹{savings.toFixed(0)} on this order!</p>
      )}
    </div>
  );
});

function CartContent() {
  const { cart, updateQuantity, removeFromCart, clearCart, total } = useOptimisticCart();
  const { initiateCheckout, isProcessing, paymentResult, resetPayment } = useRazorpay();
  const { data: session, isPending } = useSession();
  const deliveryAddress = useMenuDeliveryAddress();
  const appliedCoupon = useCartCoupon();
  const orderType = useCartOrderType();
  const { addToCart, applyCoupon, removeCoupon, setOrderType } = useCartActions();
  const razorpayConfigured = typeof process !== "undefined" && !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(razorpayConfigured ? "RAZORPAY" : "CASH_ON_DELIVERY");
  const [codProcessing, setCodProcessing] = useState(false);
  const [showCouponOffers, setShowCouponOffers] = useState(false);
  const [showPaymentOffers, setShowPaymentOffers] = useState(false);
  const [selectedPaymentOffer, setSelectedPaymentOffer] = useState<PaymentOfferData | null>(null);
  const [popupItem, setPopupItem] = useState<AddPopupItem | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [addressSheetOpen, setAddressSheetOpen] = useState(false);

  const bucketedTotal = useMemo(() => Math.round(total / 50) * 50, [total]);

  const { data: couponOffers = [], isLoading: couponOffersLoading } = useQuery({
    queryKey: ["cart-coupon-offers", bucketedTotal],
    queryFn: async () => {
      const res = await fetch("/api/coupon/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartTotal: total }),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return (data.coupons || []) as CouponOffer[];
    },
    enabled: showCouponOffers,
    staleTime: 60_000,
    gcTime: 300_000,
  });

  const { data: suggestedItems = [] } = useQuery({
    queryKey: ["cart-suggested-items"],
    queryFn: async () => {
      const res = await fetch("/api/menu/tomorrow?bestseller=true");
      if (!res.ok) return [];
      const data = await res.json();
      return (data || []).slice(0, 10) as SuggestedItem[];
    },
    staleTime: 300_000,
    gcTime: 600_000,
  });

  const handleShowSuggestionPopup = useCallback((item: {
    id: string; name: string; price: number; compareAtPrice: number | null;
    foodType: string; timeSlot: string; kitchenName: string; imageUrl?: string | null;
  }) => {
    addToCart({
      id: item.id, name: item.name, price: Number(item.price), qty: 1,
      foodType: item.foodType, timeSlot: item.timeSlot, kitchenName: item.kitchenName,
    });
    setPopupItem({
      id: item.id, name: item.name, price: Number(item.price),
      compareAtPrice: item.compareAtPrice ?? null, foodType: item.foodType,
      imageUrl: item.imageUrl ?? null, kitchenName: item.kitchenName, timeSlot: item.timeSlot,
    });
    setPopupOpen(true);
  }, [addToCart]);

  const { data: paymentOffers = [] } = useQuery({
    queryKey: ["cart-payment-offers", bucketedTotal],
    queryFn: async () => {
      const res = await fetch("/api/payment-offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartTotal: total }),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return (data.offers || []) as PaymentOfferData[];
    },
    staleTime: 60_000,
    gcTime: 300_000,
  });

  const handleCheckout = useEventCallback(async () => {
    if (!deliveryAddress) {
      toast.error("Please select a delivery location before placing your order");
      return;
    }
    if (!razorpayConfigured && paymentMethod === "RAZORPAY") {
      toast.error("Online payment is not available. Please select Cash on Delivery.");
      return;
    }
    if (paymentMethod === "CASH_ON_DELIVERY") {
      setCodProcessing(true);
      try {
        const res = await fetch("/api/payment/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: cart.map((i) => ({ id: i.id, qty: i.qty, price: i.price })),
            couponCode: appliedCoupon?.code,
            paymentProvider: "CASH_ON_DELIVERY",
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Failed to create order" }));
          throw new Error(err.error || "Failed to create order");
        }
        const order = await res.json();
        clearCart();
        resetPayment();
        window.location.href = `/account/orders?placed=${order.localOrderId || order.orderId}`;
      } catch (err) {
        console.error("[COD] Checkout failed:", err);
        toast.error(err instanceof Error ? err.message : "Checkout failed");
      } finally {
        setCodProcessing(false);
      }
      return;
    }
    const phone = session?.user?.phoneNumber ?? "";
    await initiateCheckout(cart, total, phone, appliedCoupon?.code);
  });

  const handleApplyOfferCoupon = useEventCallback((code: string) => {
    applyCoupon({
      code, discount: 0, type: "PERCENTAGE", description: "Applying coupon...",
    });
    setShowCouponOffers(false);
    toast.success(`Coupon ${code} selected — enter it below to apply`);
  });

  if (paymentResult?.success) {
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
        {paymentResult.orderId && <CravingsPopup orderId={paymentResult.orderId} />}
      </main>
    );
  }

  if (isPending) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 px-4 py-24 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground/40" />
        </div>
      </main>
    );
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
  const paymentOfferSavings = selectedPaymentOffer
    ? selectedPaymentOffer.discountType === "FLAT"
      ? selectedPaymentOffer.discountValue
      : Math.min(
          Math.round(total * (selectedPaymentOffer.discountValue / 100)),
          selectedPaymentOffer.maxDiscount ?? Infinity,
        )
    : 0;
  const savings = couponSavings + paymentOfferSavings;
  const finalTotal = Math.max(0, total - savings);
  const itemQtyMap = new Map(cart.map(i => [i.id, i.qty]));

  const itemCounts = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 pb-24 md:pb-8">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8">
          {/* Mobile: Cart items first, then address/order/payment */}
          {/* Desktop: Address/order/payment left, Cart items right */}

          {/* Cart Items, Suggested Items, Price Breakdown */}
          <div className="order-1 lg:order-2 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href="/categories" className="md:hidden p-1 -ml-1 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold">Your Cart</h1>
                  <p className="text-sm text-muted-foreground">
                    {itemCounts} item{itemCounts !== 1 ? "s" : ""} · ₹{total.toFixed(0)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clearCart}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>
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

            {suggestedItems.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <h2 className="text-sm font-bold">Add More Items</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {suggestedItems.map((sItem) => (
                    <SuggestedItemCard
                      key={sItem.id}
                      item={sItem}
                      qty={itemQtyMap.get(sItem.id) || 0}
                      onAdd={handleShowSuggestionPopup}
                      onUpdateQuantity={updateQuantity}
                      onShowPopup={(item) => {
                        setPopupItem({
                          id: item.id, name: item.name, price: Number(item.price),
                          compareAtPrice: item.compareAtPrice ?? null, foodType: item.foodType,
                          imageUrl: item.imageUrl ?? null, kitchenName: item.kitchenName, timeSlot: item.timeSlot,
                        });
                        setPopupOpen(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <PriceBreakdown
              itemCounts={itemCounts}
              total={total}
              couponSavings={couponSavings}
              paymentOfferSavings={paymentOfferSavings}
              savings={savings}
              finalTotal={finalTotal}
            />
          </div>

          {/* Address, Order Type, Coupon, Payment Offers, Payment Method */}
          <div className="order-2 lg:order-1 space-y-6">
            <div className="hidden md:block">
              <DeliveryAddressCard open={addressSheetOpen} onOpenChange={setAddressSheetOpen} />
            </div>

            <Separator />

            <OrderTypeSelector selected={orderType} onSelect={setOrderType} />

            <Separator />

            <CouponOffersPanel
              show={showCouponOffers}
              loading={couponOffersLoading}
              offers={couponOffers}
              appliedCoupon={appliedCoupon}
              onToggle={() => setShowCouponOffers((p) => !p)}
              onApply={handleApplyOfferCoupon}
              onApplyCoupon={(coupon) => applyCoupon({
                code: coupon.code, discount: coupon.discount,
                type: coupon.type, description: coupon.description,
              })}
              onRemoveCoupon={removeCoupon}
              total={total}
            />

            <Separator />

            <PaymentOffersPanel
              show={showPaymentOffers}
              offers={paymentOffers}
              selectedId={selectedPaymentOffer?.id ?? null}
              onToggle={() => setShowPaymentOffers((p) => !p)}
              onSelect={setSelectedPaymentOffer}
            />

            <Separator />

            <PaymentMethodSelector
              selected={paymentMethod}
              onSelect={(m) => { if (m === "RAZORPAY" && !razorpayConfigured) return; setPaymentMethod(m) }}
              codAvailable={true}
              razorpayAvailable={razorpayConfigured}
            />

            {/* Desktop checkout buttons */}
            <div className="hidden md:flex gap-3">
              <Button variant="outline" asChild className="flex-1">
                <Link href="/categories">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Browse Categories
                </Link>
              </Button>
              <Button
                className="flex-1"
                onClick={handleCheckout}
                disabled={isProcessing || codProcessing}
              >
                {isProcessing || codProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing…
                  </>
                ) : paymentMethod === "CASH_ON_DELIVERY" ? (
                  <>
                    <Banknote className="mr-2 h-4 w-4" />
                    Place Order (COD)
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay ₹{finalTotal.toFixed(0)}
                  </>
                )}
              </Button>
            </div>
            {paymentResult && !paymentResult.success && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive text-center">
                {paymentResult.error || "Payment failed. Please try again."}
              </div>
            )}
          </div>
        </div>

        {/* Mobile fixed bottom checkout bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-4 md:hidden space-y-2">
          {!deliveryAddress && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span>You seem to be in a new location</span>
            </div>
          )}
          {!deliveryAddress ? (
            <Button
              className="w-full"
              size="lg"
              onClick={() => setAddressSheetOpen(true)}
            >
              <MapPin className="mr-2 h-4 w-4" />
              Add Address to Proceed
            </Button>
          ) : (
            <Button
              className="w-full"
              size="lg"
              onClick={handleCheckout}
              disabled={isProcessing || codProcessing}
            >
              {isProcessing || codProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing…
                </>
              ) : paymentMethod === "CASH_ON_DELIVERY" ? (
                <>
                  <Banknote className="mr-2 h-4 w-4" />
                  Place Order (COD) — ₹{finalTotal.toFixed(0)}
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay ₹{finalTotal.toFixed(0)}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <AddToCartPopup
        item={popupItem}
        qty={1}
        open={popupOpen}
        onOpenChange={setPopupOpen}
      />
    </main>
  );
}

export default function CartPage() {
  return (
    <ErrorBoundary>
      <CartContent />
    </ErrorBoundary>
  );
}
