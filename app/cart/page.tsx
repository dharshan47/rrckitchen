"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";

export default function CartPage() {
  const cart = useCartStore((s) => s.cart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const clearCart = useCartStore((s) => s.clearCart);

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

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
          <Button variant="outline" size="sm" onClick={clearCart}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>

        <div className="space-y-4">
          {cart.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">{item.name}</span>
                    <Badge variant={item.foodType === "VEG" ? "secondary" : "destructive"} className="shrink-0 text-[9px] px-1.5 py-0">
                      {item.foodType}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.kitchenName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.timeSlot.replace(/([A-Z])/g, " $1").trim()}
                  </p>
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
            <Button asChild className="flex-1">
              <Link href="/login">Proceed to Checkout</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
