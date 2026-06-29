"use client";

import { Badge, Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui";
import { useCartStore } from "@/stores";
import { useTomorrowMenu } from "@/hooks/useTomorrowMenu";

export default function MenuGrid() {
  const { data, isLoading, isError } = useTomorrowMenu();
  const addToCart = useCartStore((state) => state.addToCart);
  const items = data ?? [];

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-56 animate-pulse rounded-3xl border border-border bg-slate-100" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-center text-sm text-destructive">Unable to load menu items right now.</p>;
  }

  if (!items.length) {
    return <p className="rounded-3xl border border-border bg-white p-8 text-center text-sm text-muted-foreground">No matching meals found. Try a different search or filter.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item: any) => (
        <Card key={item.id} className="overflow-hidden border border-border bg-white">
          <CardHeader className="px-6 py-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>{item.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {item.menu?.kitchenPartner?.kitchenAlias?.displayName ?? "Local kitchen"}
                </p>
              </div>
              <Badge variant="outline">{item.foodType}</Badge>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-4">
            <p className="text-sm leading-6 text-muted-foreground">
              {item.description ?? "Menu item available for tomorrow."}
            </p>
          </CardContent>
          <CardFooter className="flex items-center justify-between gap-4 px-6 py-4">
            <div>
              <p className="text-lg font-semibold text-foreground">₹{item.price}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {item.timeSlot.replace(/([A-Z])/g, " $1").trim()}
              </p>
            </div>
            <Button
              size="sm"
              onClick={() =>
                addToCart({
                  id: item.id,
                  name: item.name,
                  price: Number(item.price),
                  qty: 1,
                  foodType: item.foodType,
                  timeSlot: item.timeSlot,
                  kitchenName: item.menu?.kitchenPartner?.kitchenAlias?.displayName ?? "Home kitchen",
                })
              }
            >
              Add
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
