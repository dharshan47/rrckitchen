"use client";

import { ShoppingCart, Check, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface AddPopupItem {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  foodType: string;
  imageUrl?: string | null;
  kitchenName: string;
  timeSlot: string;
}

interface AddToCartPopupProps {
  item: AddPopupItem | null;
  qty?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddToCartPopup({ item, qty = 1, open, onOpenChange }: AddToCartPopupProps) {
  if (!item || !open) return null;

  return (
    <>
      {/* Desktop: top center */}
      <div className={cn(
        "hidden md:flex fixed top-24 left-1/2 -translate-x-1/2 z-[999 w-[420px]",
        "animate-in fade-in slide-in-from-top-2 duration-300"
      )}>
        <CardContent item={item} qty={qty} onClose={() => onOpenChange(false)} />
      </div>

      {/* Mobile: above bottom nav */}
      <div className={cn(
        "md:hidden fixed bottom-20 left-3 right-3 z-[999",
        "animate-in fade-in slide-in-from-bottom-2 duration-300"
      )}>
        <CardContent item={item} qty={qty} onClose={() => onOpenChange(false)} />
      </div>
    </>
  );
}

function BadgeVeg({ foodType }: { foodType: string }) {
  return (
    <span className={`inline-block h-2.5 w-2.5 rounded-xs border shrink-0 ${foodType === "NONVEG" ? "border-red-600 bg-red-600" : "border-green-600 bg-green-600"}`} />
  );
}

function CardContent({ item, qty, onClose }: { item: AddPopupItem; qty: number; onClose: () => void }) {
  return (
    <Link
      href="/cart"
      onClick={onClose}
      className="block rounded-lg bg-primary p-3 shadow-lg hover:brightness-110 transition-all border border-primary/50"
    >
      <div className="flex items-center gap-2.5">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-primary-foreground/20">
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="40px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-primary-foreground/60" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-primary-foreground shrink-0" />
            <p className="text-[10px] font-semibold text-primary-foreground/80 uppercase tracking-wider">Added to Cart</p>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <BadgeVeg foodType={item.foodType} />
            <p className="text-xs font-bold text-primary-foreground truncate">{item.name}</p>
          </div>
          <p className="text-[10px] text-primary-foreground/70">
            ₹{item.price} · {qty} ITEM{qty > 1 ? "S" : ""}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-primary-foreground/60 shrink-0 ml-1" />
      </div>
    </Link>
  );
}
