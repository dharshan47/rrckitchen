"use client";

export const dynamic = "force-dynamic";

import { useCallback, useState } from "react";
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
import { CouponInput } from "@/components/order/coupon-input";
import { PaymentMethodSelector, type PaymentMethod } from "@/components/order/payment-method-selector";
import { OrderTypeSelector } from "@/components/order/order-type-selector";
import { CravingsPopup } from "@/components/order/cravings-popup";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowLeft,
  CreditCard,
  Loader2,
  Banknote,
  Tag,
  Percent,
  Gift,
  ChevronRight,
  Wallet,
  Smartphone,
  Building2,
  Gem,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

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

const offerIcons: Record<string, { icon: typeof Smartphone; label: string; color: string }> = {
  UPI: { icon: Smartphone, label: "UPI", color: "text-purple-600 bg-purple-100" },
  WALLET: { icon: Gem, label: "Wallet", color: "text-emerald-600 bg-emerald-100" },
  CARDS: { icon: CreditCard, label: "Cards", color: "text-blue-600 bg-blue-100" },
  NETBANKING: { icon: Building2, label: "Net Banking", color: "text-orange-600 bg-orange-100" },
  ALL: { icon: Wallet, label: "All Methods", color: "text-primary bg-primary/10" },
};

function CartContent() {
  const { cart, updateQuantity, removeFromCart, clearCart, total } =
    useOptimisticCart();
  const { initiateCheckout, isProcessing, paymentResult, resetPayment } =
    useRazorpay();
  const { data: session, isPending } = useSession();
  const deliveryAddress = useMenuDeliveryAddress();
  const appliedCoupon = useCartCoupon();
  const orderType = useCartOrderType();
  const { applyCoupon, removeCoupon, setOrderType } = useCartActions();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("RAZORPAY");
  const [codProcessing, setCodProcessing] = useState(false);
  const [showCouponOffers, setShowCouponOffers] = useState(false);
  const [showPaymentOffers, setShowPaymentOffers] = useState(false);
  const [selectedPaymentOffer, setSelectedPaymentOffer] = useState<PaymentOfferData | null>(null);

  const { data: couponOffers = [], isLoading: couponOffersLoading } = useQuery({
    queryKey: ["cart-coupon-offers", total],
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
    staleTime: 30_000,
  });

  const { data: paymentOffers = [] } = useQuery({
    queryKey: ["cart-payment-offers", total],
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
    staleTime: 30_000,
  });

  const handleCheckout = useCallback(async () => {
    if (!deliveryAddress) {
      toast.error("Please select a delivery location before placing your order");
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
  }, [cart, total, initiateCheckout, session, paymentMethod, appliedCoupon, clearCart, resetPayment, deliveryAddress]);

  const handleApplyOfferCoupon = useCallback((code: string) => {
    applyCoupon({
      code,
      discount: 0,
      type: "PERCENTAGE",
      description: "Applying coupon...",
    });
    setShowCouponOffers(false);
    toast.success(`Coupon ${code} selected — enter it below to apply`);
  }, [applyCoupon]);

  if (paymentResult?.success) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 px-4 py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <ShoppingBag className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Order Placed! 🎉</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your order has been placed successfully.
            </p>
            <p className="mt-1 text-xs text-muted-foreground font-mono">
              Order ID: {paymentResult.orderId}
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline" onClick={resetPayment}>
              <Link href="/menu">Browse More</Link>
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
            <p className="mt-2 text-sm text-muted-foreground">
              Please log in to see your cart and place orders.
            </p>
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
            <p className="mt-2 text-sm text-muted-foreground">
              Add items from the menu to get started.
            </p>
          </div>
          <Button asChild>
            <Link href="/menu">Browse Menu</Link>
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
  const itemCounts = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-8 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Your Cart</h1>
            <p className="text-sm text-muted-foreground">
              {itemCounts} item{itemCounts !== 1 ? "s" : ""} · ₹{total.toFixed(0)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearCart}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="space-y-3">
          {cart.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="h-16 w-16 shrink-0 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt="" width={64} height={64} className="h-full w-full object-cover" />
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
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.kitchenName}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatTimeSlot(item.timeSlot)}
                  </p>
                  <p className="mt-1 text-sm font-bold">₹{item.price} <span className="text-xs font-normal text-muted-foreground">× {item.qty}</span></p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, item.qty - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center text-sm font-medium">
                    {item.qty}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, item.qty + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="my-5" />

        <div className="space-y-5">
          <OrderTypeSelector
            selected={orderType}
            onSelect={setOrderType}
          />

          <Separator />

          {/* Coupon Offers Section */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowCouponOffers(!showCouponOffers)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">View Coupon Offers</span>
              </div>
              <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${showCouponOffers ? "rotate-90" : ""}`} />
            </button>

            {showCouponOffers && (
              <Card className="p-3 space-y-2">
                {couponOffersLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : couponOffers.length === 0 ? (
                  <div className="text-center py-4">
                    <Gift className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">No coupon offers available right now</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Enter your own coupon code below</p>
                  </div>
                ) : (
                  couponOffers.map((offer) => (
                    <button
                      key={offer.code}
                      type="button"
                      onClick={() => handleApplyOfferCoupon(offer.code)}
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
                  ))
                )}
                <CouponInput
                  onApply={(coupon) => applyCoupon({
                    code: coupon.code,
                    discount: coupon.discount,
                    type: coupon.type,
                    description: coupon.description,
                  })}
                  onRemove={removeCoupon}
                  appliedCoupon={appliedCoupon ? {
                    code: appliedCoupon.code,
                    discount: appliedCoupon.discount,
                    type: appliedCoupon.type,
                    description: appliedCoupon.description,
                  } : null}
                  cartTotal={total}
                />
              </Card>
            )}
          </div>

          <Separator />

          {/* Payment Offers Section */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowPaymentOffers(!showPaymentOffers)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Payment Offers</span>
              </div>
              <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${showPaymentOffers ? "rotate-90" : ""}`} />
            </button>

            {showPaymentOffers && (
              <div className="space-y-2">
                {paymentOffers.length === 0 ? (
                  <div className="text-center py-4">
                    <Wallet className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">No payment offers available</p>
                  </div>
                ) : (
                  paymentOffers.map((offer) => {
                    const info = offerIcons[offer.offerType] ?? offerIcons.ALL;
                    const Icon = info.icon;
                    const isSelected = selectedPaymentOffer?.id === offer.id;
                    const discountLabel = offer.discountType === "FLAT"
                      ? `₹${offer.discountValue} off`
                      : `${offer.discountValue}% off${offer.maxDiscount ? ` (up to ₹${offer.maxDiscount})` : ""}`;
                    return (
                      <button
                        key={offer.id}
                        type="button"
                        onClick={() => setSelectedPaymentOffer(isSelected ? null : offer)}
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

          <Separator />

          {/* Price Breakdown */}
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

          <Separator />

          <PaymentMethodSelector
            selected={paymentMethod}
            onSelect={setPaymentMethod}
            codAvailable={true}
          />

          <div className="flex gap-3">
            <Button variant="outline" asChild className="flex-1">
              <Link href="/menu">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Add More
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