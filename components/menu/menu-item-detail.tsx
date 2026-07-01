"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressiveImage } from "@/components/patterns/progressive-image";
import { useCartActions } from "@/stores";
import { formatTimeSlot, createBadgeVariant } from "@/lib/patterns";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  RefreshCw,
  Truck,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface MenuItemPhoto {
  id?: string;
  imageUrl: string;
  sortOrder: number;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  foodType: string;
  timeSlot: string;
  isAvailable: boolean;
  menu: { kitchenPartner: { kitchenAlias: { displayName: string } | null } | null } | null;
  photos: MenuItemPhoto[];
}

interface MenuItemDetailProps {
  item: MenuItem;
}

export function MenuItemDetail({ item }: MenuItemDetailProps) {
  const [detailImageIndex, setDetailImageIndex] = useState(0);
  const addToCart = useCartActions().addToCart;

  const handlePrevImage = useCallback(() => {
    setDetailImageIndex((i) => (i > 0 ? i - 1 : item.photos.length - 1));
  }, [item.photos.length]);

  const handleNextImage = useCallback(() => {
    setDetailImageIndex((i) => (i < item.photos.length - 1 ? i + 1 : 0));
  }, [item.photos.length]);

  const kitchenName = item.menu?.kitchenPartner?.kitchenAlias?.displayName ?? "Local kitchen";
  const hasMultiplePhotos = item.photos?.length > 1;
  const price = Number(item.price);
  const mrp = Math.round(price * 1.35);
  const offAmount = mrp - price;

  const handleAddToCart = useCallback(() => {
    addToCart({
      id: item.id,
      name: item.name,
      price,
      qty: 1,
      foodType: item.foodType,
      timeSlot: item.timeSlot,
      kitchenName,
    });
  }, [addToCart, item, price, kitchenName]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-lg">
        {/* Header with back button */}
        <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
          <Link href="/menu" className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold truncate">{item.name}</h1>
        </div>

        {/* Image Gallery */}
        <div className="relative h-80 bg-slate-100">
          {item.photos?.length > 0 ? (
            <>
              <ProgressiveImage
                src={item.photos[detailImageIndex]?.imageUrl}
                alt={item.name}
                fill
              />
              {hasMultiplePhotos && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 text-foreground flex items-center justify-center shadow-md hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 text-foreground flex items-center justify-center shadow-md hover:bg-white transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {item.photos.map((_, i) => (
                      <span
                        key={i}
                        className={`h-2 w-2 rounded-full ${i === detailImageIndex ? "bg-white shadow-sm" : "bg-white/50"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <span className="text-7xl font-bold text-muted-foreground/15">{item.name.charAt(0)}</span>
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {hasMultiplePhotos && (
          <div className="flex gap-2 px-5 py-3 border-b border-border overflow-x-auto">
            {item.photos.map((photo, i) => (
              <button
                key={photo.id ?? `thumb-${i}`}
                onClick={() => setDetailImageIndex(i)}
                className={`h-14 w-14 rounded-lg overflow-hidden border-2 shrink-0 relative transition-all ${
                  i === detailImageIndex ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <ProgressiveImage src={photo.imageUrl} alt="" fill />
              </button>
            ))}
          </div>
        )}

        <div className="px-5 pt-5 pb-6 space-y-5">
          {/* Product Name & Badge */}
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-bold text-foreground">{item.name}</h2>
            <Badge variant={createBadgeVariant(item.foodType)} className="shrink-0 mt-1">
              {item.foodType}
            </Badge>
          </div>

          {/* Price Section */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl font-bold text-foreground">₹{price}</span>
            <span className="text-base text-muted-foreground line-through">₹{mrp}</span>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
              ₹{offAmount} OFF
            </span>
            <span className="text-xs text-muted-foreground ml-1">(incl. of all taxes)</span>
          </div>

          {/* Net Qty & Rating */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Net Qty: 1 Serving</span>
            <span className="text-muted-foreground/40">•</span>
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-foreground font-medium">4.6</span>
              (120+)
            </span>
          </div>

          {/* Delivery Info Badges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 p-3">
              <RefreshCw className="h-5 w-5 text-green-600 shrink-0" />
              <p className="text-sm font-medium text-green-700">Same Day Exchange</p>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-orange-50 border border-orange-200 p-3">
              <Truck className="h-5 w-5 text-orange-600 shrink-0" />
              <p className="text-sm font-medium text-orange-700">Fast Delivery</p>
            </div>
          </div>

          {/* Highlights */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Highlights
            </h3>
            <div className="rounded-xl border border-border divide-y divide-border text-sm">
              <div className="flex items-start justify-between px-4 py-3">
                <span className="text-muted-foreground">brand</span>
                <span className="font-medium text-foreground text-right max-w-[60%]">{kitchenName}</span>
              </div>
              <div className="flex items-start justify-between px-4 py-3">
                <span className="text-muted-foreground">dietary preference</span>
                <span className="font-medium text-foreground text-right">{item.foodType === "VEG" ? "Veg" : "Non Veg"}</span>
              </div>
              <div className="px-4 py-3">
                <span className="text-muted-foreground block mb-1">allergen information</span>
                <span className="text-foreground">Contains: Home-cooked ingredients. Please consult the kitchen for specific allergen details.</span>
              </div>
              {item.description && (
                <div className="px-4 py-3">
                  <span className="text-muted-foreground block mb-1">About</span>
                  <span className="text-foreground leading-6">{item.description}</span>
                </div>
              )}
              <div className="flex items-start justify-between px-4 py-3">
                <span className="text-muted-foreground">time slot</span>
                <span className="font-medium text-foreground text-right">{formatTimeSlot(item.timeSlot)}</span>
              </div>
            </div>
          </div>

          {/* Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Information
            </h3>
            <div className="rounded-xl border border-border divide-y divide-border text-sm">
              <div className="px-4 py-3">
                <span className="text-muted-foreground block mb-1">Disclaimer</span>
                <span className="text-foreground text-xs leading-5">
                  All images are for representational purposes only. It is advised that you read the batch and manufacturing details, directions for use, allergen information, health and nutritional claims (wherever applicable), and other details mentioned on the label before consuming the product. For combo items, individual prices can be viewed on the page.
                </span>
              </div>
              <div className="px-4 py-3">
                <span className="text-muted-foreground block mb-1">Customer Care Details</span>
                <span className="text-foreground text-xs leading-5">
                  In case of any issue, contact us
                  <br />
                  E-mail address: support@rrckitchen.com
                </span>
              </div>
              <div className="flex items-start justify-between px-4 py-3">
                <span className="text-muted-foreground">Seller Name</span>
                <span className="font-medium text-foreground text-right max-w-[55%]">{kitchenName}</span>
              </div>
              <div className="px-4 py-3">
                <span className="text-muted-foreground block mb-1">Seller Address</span>
                <span className="text-foreground text-xs leading-5">Prepared fresh in a home kitchen. Contact the kitchen for location details.</span>
              </div>
              <div className="flex items-start justify-between px-4 py-3">
                <span className="text-muted-foreground">Country of Origin</span>
                <span className="font-medium text-foreground text-right">India</span>
              </div>
              <div className="flex items-start justify-between px-4 py-3">
                <span className="text-muted-foreground">Shelf Life</span>
                <span className="font-medium text-foreground text-right">Consume within 24 hours</span>
              </div>
            </div>
          </div>

          {/* Add to Cart */}
          <Button
            size="lg"
            className="w-full rounded-full text-base"
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </main>
  );
}
