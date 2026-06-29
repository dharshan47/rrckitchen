"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Badge, Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui";
import { MenuControls, MenuGrid } from "@/components/menu";
import { useMenuStore } from "@/stores";

export default function MenuPage() {
  const searchParams = useSearchParams();
  const setSelectedTimeSlot = useMenuStore((s) => s.setSelectedTimeSlot);

  useEffect(() => {
    const timeSlot = searchParams.get("timeSlot");
    if (timeSlot === "MORNING" || timeSlot === "LUNCH" || timeSlot === "EVENINGSNACKS" || timeSlot === "DINNER") {
      setSelectedTimeSlot(timeSlot);
    }
  }, [searchParams, setSelectedTimeSlot]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10">
        <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary">Tomorrow</Badge>
              <span className="text-sm text-muted-foreground">Available menus are slot-filtered and anonymized.</span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight">Tomorrow&rsquo;s Menu</h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              Browse home-cooked meals by time slot, Veg/Non-Veg, and Kitchen alias. Add to cart and checkout with Razorpay.
            </p>
          </div>
          <Card className="rounded-[2rem] border border-border bg-slate-50 p-6">
            <CardHeader className="px-0 pb-4">
              <CardTitle>Quick start</CardTitle>
              <CardDescription>Tap any item to preview its kitchen and add your favorites to the cart.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 px-0">
              <div className="rounded-3xl border border-border bg-white p-4">
                <p className="text-sm font-semibold text-foreground">T+1 booking</p>
                <p className="mt-2 text-sm text-muted-foreground">Orders are always for tomorrow, not today.</p>
              </div>
              <div className="rounded-3xl border border-border bg-white p-4">
                <p className="text-sm font-semibold text-foreground">Availability cut-off</p>
                <p className="mt-2 text-sm text-muted-foreground">All kitchen availability is time-gated server-side.</p>
              </div>
            </CardContent>
            <CardFooter className="px-0 pt-4">
              <Button asChild className="w-full">
                <Link href="/login">Sign in to order</Link>
              </Button>
            </CardFooter>
          </Card>
        </section>

        <section className="grid gap-4">
          <MenuControls />
          <MenuGrid />
        </section>
      </div>
    </main>
  );
}
