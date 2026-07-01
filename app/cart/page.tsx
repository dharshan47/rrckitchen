"use client";

import { useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useOptimisticCart } from "@/hooks/useOptimisticCart";
import { createBadgeVariant, formatTimeSlot } from "@/lib/patterns";
import { ErrorBoundary } from "@/components/patterns/error-boundary";
import { useRazorpay } from "@/hooks/useRazorpay";
import { useSession } from "@/lib/auth-client";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, Undo2, CreditCard, Loader2 } from "lucide-react";

function CartContent() {
  const { cart, updateQuantity, removeFromCart, clearCart, total, itemCount } = useOptimisticCart();
  const { initiateCheckout, isProcessing, paymentResult, resetPayment } = useRazorpay();
  const { data: session } = useSession();

  const handleCheckout = useCallback(async () => {
    const phone = session?.user?.phoneNumber ?? "+919876543210";
    await initiateCheckout(cart, total, phone);
  }, [cart, total, initiateCheckout, session]);

  if (paymentResult?.success) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 px-4 py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <ShoppingBag className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Order Placed!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your order has been placed successfully.
            </p>
            <p className="mt-1 text-xs text-muted-foreground font-mono">
              Order ID: {paymentResult.orderId}
            </p>
          </div>
          <Button asChild onClick={resetPayment}>
            <Link href="/menu">Browse More</Link>
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
              Add items from tomorrow&apos;s menu to get started.
            </p>
          </div>
          <Button asChild>
            <Link href="/menu">Browse Menu</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-8 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Your Cart</h1>
            <p className="text-sm text-muted-foreground">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.history.back()} title="Undo last action">
              <Undo2 className="mr-2 h-4 w-4" />
              Undo
            </Button>
            <Button variant="outline" size="sm" onClick={clearCart}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {cart.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">{item.name}</span>
                    <Badge variant={createBadgeVariant(item.foodType)} className="shrink-0 text-[9px] px-1.5 py-0">
                      {item.foodType}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.kitchenName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{formatTimeSlot(item.timeSlot)}</p>
                  <p className="mt-1 text-sm font-bold">₹{item.price}</p>
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
                  <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
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

        <Separator className="my-6" />

        <div className="space-y-4">
          <div className="flex items-center justify-between text-lg font-bold">
            <span>Total</span>
            <span>₹{total.toFixed(0)}</span>
          </div>
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
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay ₹{total.toFixed(0)}
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Secure payment via Razorpay. Pricing is being finalized.
          </p>
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
